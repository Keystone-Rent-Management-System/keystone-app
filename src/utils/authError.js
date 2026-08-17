// What we tell the user when sign-in fails, and what we tell ourselves.
//
// These are two different audiences and they were collapsed into one.
// `getError` returns `error.response.data.message` or, failing that,
// `error.message` — and Keycloak's token endpoint returns neither. Its
// body is `{error, error_description}`, so every sign-in failure fell
// through to axios's own string and the user was shown:
//
//     Request failed with status code 401
//
// which names a protocol, offers no way forward, and is the same text
// whether the password was wrong, the client id was unknown, or the
// account was disabled. The reason was not hidden deliberately — it was
// simply never read.
//
// DELIBERATELY DOES NOT DISCLOSE WHETHER THE ACCOUNT EXISTS. "No account
// with that email" is an account-enumeration oracle: anyone can probe a
// list of addresses and learn which are Keystone customers, i.e. who
// rents through us. One message covers both wrong-email and
// wrong-password.

/** Keycloak's OAuth error code, if this was an OAuth failure. */
export const oauthErrorCode = err =>
  err?.response?.data?.error ?? null;

/**
 * Developer-facing detail: status plus Keycloak's own error code and
 * description. This is what distinguishes "the password is wrong"
 * (`invalid_grant`) from "this build is misconfigured"
 * (`invalid_client`, `unauthorized_client`) — a distinction that decides
 * whether the fix is a password reset or a realm/client setting, and one
 * nobody could make from "status code 401".
 */
export const authFailureDetail = err => {
  const status = err?.response?.status ?? 'no-response';
  const data = err?.response?.data ?? {};
  const code = data.error ?? null;
  const description = data.error_description ?? null;
  return [
    `status=${status}`,
    code ? `error=${code}` : null,
    description ? `error_description=${description}` : null,
    !code && !description ? `message=${err?.message ?? 'unknown'}` : null,
  ]
    .filter(Boolean)
    .join(' ');
};

const CREDENTIAL_CODES = new Set(['invalid_grant', 'invalid_user_credentials']);

/**
 * User-facing copy. Neutral, actionable, and identical for every
 * credential-shaped failure.
 */
export const describeAuthFailure = err => {
  const code = oauthErrorCode(err);
  const status = err?.response?.status;

  // No response at all — the request never reached Keycloak.
  if (!err?.response) {
    return "We couldn't reach Keystone. Check your connection and try again.";
  }

  // Misconfiguration, not the user's fault and not fixable by them.
  // Named plainly so a tester does not go hunting for a bad password.
  if (code === 'invalid_client' || code === 'unauthorized_client') {
    return "Sign-in isn't available on this build. Please contact support.";
  }

  if (CREDENTIAL_CODES.has(code) || status === 401) {
    return "We couldn't sign you in. Check your email and password, or reset your password.";
  }

  if (status >= 500) {
    return 'Keystone is having trouble right now. Please try again shortly.';
  }

  return "We couldn't sign you in. Please try again.";
};

export default describeAuthFailure;
