// Strip credentials from Sentry events before they leave the device.
//
// Fixing the user id was necessary but not sufficient. `captureException`
// is called with axios errors, and an axios error carries `config.headers`
// — including `Authorization: Bearer …`. Sentry serialises that object, so
// a live token reached telemetry through a DERIVED value long after the
// explicit `setUser(access_token)` bug was fixed.
//
// This lives in its own module rather than inline in App.js so it can be
// tested without pulling in the navigation tree.
//
// NOTE: this only protects events sent from now on. It does NOT remove
// anything already transmitted — see docs/SECURITY-INCIDENT-sentry-token.md.

const SENSITIVE_HEADERS = /^(authorization|cookie|set-cookie|x-api-key)$/i;
const BEARER = /Bearer\s+[A-Za-z0-9._-]{20,}/g;

// A JWT with no `Bearer ` in front of it.
//
// The bearer pattern above only ever matched the header form, so it
// caught the token in `config.headers.Authorization` and missed every
// other place the same credential appears — and Keycloak's own responses
// are the worst case. `AuthServices.refreshToken` rejects with an axios
// error whose `response.data` is the token-endpoint body, so a failed
// refresh captured to Sentry carried `access_token`, `refresh_token` and
// `id_token` as bare strings in a JSON payload with no `Bearer` prefix
// anywhere in sight. Those are exactly the events we most want to look
// at, and they were the ones leaking whole sessions.
//
// Three dot-separated base64url segments, header segment anchored on the
// `eyJ` that every `{"alg"…}` JWT header encodes to. Long enough not to
// fire on ordinary dotted identifiers.
const BARE_JWT = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

// Opaque credentials that are not JWTs at all. Keycloak refresh tokens in
// particular are frequently plain UUID-shaped session handles, which no
// token-shaped regex can recognise — so these are caught by KEY instead.
//
// `code` is deliberately NOT in this list. An OAuth authorization code is
// a credential, but `code` is also the single most common key in error
// payloads (`ECONNABORTED`, HTTP codes, native error codes); redacting it
// everywhere would gut the telemetry this scrubber exists to protect.
const SENSITIVE_KEYS =
  /^(access_token|refresh_token|id_token|authorization_code|password|client_secret|session_state)$/i;

/**
 * Redact credential-shaped keys ANYWHERE in the event.
 *
 * This walked only `extra`, `contexts` and `request`, which left the
 * largest surface in a Sentry event untouched: `breadcrumbs`. An axios
 * breadcrumb carries request/response data, so an opaque (non-JWT)
 * refresh token under `breadcrumbs[].data.refresh_token` matched neither
 * the JWT pattern nor any walked branch and went out intact. Arrays are
 * traversed too — `Object.keys` on an array gives its indices, and
 * breadcrumbs are an array.
 *
 * `seen` guards against cycles: Sentry events routinely contain circular
 * references (a config pointing back at its request), and this used to be
 * reachable only through shallow branches where that did not come up.
 */
const scrubHeaders = headers => {
  if (!headers || typeof headers !== 'object') return headers;
  // Sentry also carries headers as an array of [name, value] pairs.
  // Iterating `Object.keys` over that gives INDICES, so the pair form was
  // walked and matched nothing — silently.
  if (Array.isArray(headers)) {
    return headers.map(entry =>
      Array.isArray(entry) && SENSITIVE_HEADERS.test(String(entry[0]))
        ? [entry[0], '[redacted]']
        : entry,
    );
  }
  const out = {...headers};
  for (const key of Object.keys(out)) {
    if (SENSITIVE_HEADERS.test(key)) out[key] = '[redacted]';
  }
  return out;
};

/**
 * ONE walk of the WHOLE event, redacting both credential-shaped keys and
 * sensitive headers wherever they occur.
 *
 * There used to be two walkers with two different reaches, and the gap
 * between them was the bug. The key walker was made global; the HEADER
 * walker still visited only `request`, `extra` and `contexts` — so a
 * `Cookie`, `Set-Cookie` or `X-Api-Key` inside `breadcrumbs[].data.headers`
 * matched no sensitive key, was not a JWT, and went out intact. Two
 * walkers meant two chances to forget a branch; there is now one.
 *
 * Arrays are traversed (`Object.keys` on an array yields its indices, and
 * `breadcrumbs` is an array). `seen` guards cycles: Sentry events
 * routinely contain them, and an unguarded walk blows the stack into
 * `scrubEvent`'s catch-all, which returns the event UNSCRUBBED.
 */
const scrubDeep = (value, seen = new WeakSet()) => {
  if (!value || typeof value !== 'object') return;
  if (seen.has(value)) return;
  seen.add(value);
  for (const key of Object.keys(value)) {
    const child = value[key];
    if (SENSITIVE_KEYS.test(key)) {
      if (typeof child === 'string') value[key] = '[redacted]';
      continue;
    }
    if (key === 'headers') {
      value[key] = scrubHeaders(child);
      continue;
    }
    scrubDeep(child, seen);
  }
};

export const scrubEvent = event => {
  try {
    // Credential-shaped keys AND sensitive headers, wherever they sit —
    // the whole event, not a list of branches someone remembered.
    scrubDeep(event);

    // Belt and braces: a token can appear as a bare string in a message,
    // a breadcrumb, or a serialised response body — with or without the
    // `Bearer ` prefix.
    //
    // Cycle-safe. A plain `JSON.stringify` THROWS on a circular event
    // (Sentry events routinely contain them), which landed in the
    // catch-all below and skipped this entire pass without a trace — so
    // the events most likely to carry a token were the ones least likely
    // to be string-scrubbed.
    const stringifySeen = new WeakSet();
    const json = JSON.stringify(event, (key, value) => {
      if (value && typeof value === 'object') {
        if (stringifySeen.has(value)) return '[circular]';
        stringifySeen.add(value);
      }
      return value;
    });
    // `.test` on a /g regex advances lastIndex, so a shared literal that
    // has already been tested starts mid-string on the next call and
    // reports a false negative. Reset before each use.
    BEARER.lastIndex = 0;
    BARE_JWT.lastIndex = 0;
    if (BEARER.test(json) || BARE_JWT.test(json)) {
      BEARER.lastIndex = 0;
      BARE_JWT.lastIndex = 0;
      return JSON.parse(
        json
          .replace(BEARER, 'Bearer [redacted]')
          .replace(BARE_JWT, '[redacted-jwt]'),
      );
    }
  } catch (e) {
    // Scrubbing must never take error reporting down with it.
  }
  return event;
};

export default scrubEvent;
