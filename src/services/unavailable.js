import {USE_MOBILE_MOCKS} from './mocks';

// Shared "is this endpoint actually usable yet?" predicate.
//
// Each service degrades to a bundled fixture when the Keystone gateway
// cannot serve a read rollup. The original test was `404 || 501 ||
// undefined`, which turned out to be too narrow once the app was pointed
// at the live dev gateway (2026-07-29). What the BE actually returns for
// not-yet-shipped routes:
//
//   /portfolio/performance    404  — no route (the case we handled)
//   /maintenance/summary      404
//   /compliance/alerts        404
//   /tenants/rent-summary     400  — swallowed by `/tenants/{id}`:
//                                    "Parameter 'id' must be a valid
//                                    UUID (got 'rent-summary')"
//   /agreements/expiring      400  — same collision under /agreements/{id}
//   /transactional-reports    500  — endpoint exists but throws
//   /search/tenant/invoices   403  — tenant-scoped, denied for landlords
//
// Under the narrow test every one of those non-404s propagated as a
// thrown error, so the tenant surface hard-failed against a live backend
// while looking fine on fixtures. These are all read-only rollups with no
// user-supplied body, so a 4xx/5xx means "the BE can't give me this",
// never "the user typed something wrong" — degrading is right.
//
// 401 is deliberately EXCLUDED: it belongs to the refresh interceptor in
// AxiosServices, which retries the request with a new bearer and signs
// the user out if the refresh fails. Swallowing it here would hide an
// expired session behind stale fixture data.

const UNAVAILABLE = [400, 403, 404, 405, 500, 501, 502, 503, 504];

/**
 * True when `err` means the endpoint can't serve us and the caller
 * should fall back to its fixture.
 * @param {unknown} err an axios error
 */
const seen = new Set();

/** One line per endpoint, so a cold open doesn't spam the console. */
const report = (err, status) => {
  const cfg = err?.config ?? {};
  const route = `${(cfg.method ?? 'get').toUpperCase()} ${cfg.url ?? '?'}`;
  if (seen.has(route)) {
    return;
  }
  seen.add(route);
  const why = status === undefined ? 'no response (offline/timeout)' : status;
  // eslint-disable-next-line no-console
  console.warn(`[live] ${route} → ${why}; falling back to fixture`);
};

export const isEndpointUnavailable = err => {
  // NOTHING IS EVER FABRICATED OUTSIDE EXPLICIT FIXTURES MODE.
  //
  // There are exactly two states, and no blend of the two:
  //   Fixtures  — everything is a fixture, no network call is made.
  //   Live      — everything is real. A failure is shown as a failure.
  //
  // This gate is what enforces that. It used to be ungated, which caused
  // two bad outcomes. In production, a 404 — most of the tenant surface
  // today — rendered demo data to a real user: "Sarah Chen", $1,800 of
  // rent, invented compliance notices. Showing a renter someone else's
  // rent as if it were theirs is far worse than showing nothing. And in
  // development it made "Live" a lie: a screen silently blended real and
  // invented rows, so nobody could tell which endpoints actually worked.
  //
  // Returning false makes every service rethrow; react-query surfaces
  // `error`, screens fall back to their own `?? {}` / `?? []` empties,
  // and Screen's `loadError` strip says so out loud.
  if (!USE_MOBILE_MOCKS) {
    return false;
  }

  // A dead session must reach the user, never be papered over with
  // fixtures. The refresh interceptor rejects with a bare Error, so
  // there is no status to test — it tags the error instead.
  if (err?.isAuthFailure) {
    return false;
  }
  const status = err?.response?.status;
  // `undefined` = no response at all: offline, DNS failure, timeout.
  const unavailable = status === undefined || UNAVAILABLE.includes(status);
  if (unavailable) {
    report(err, status);
  }
  return unavailable;
};

export default isEndpointUnavailable;
