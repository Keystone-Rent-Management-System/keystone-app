/* eslint-env jest */
//
// Sign-in failure copy.
//
// Found on a real device: the app showed "Request failed with status code
// 401". `getError` reads `response.data.message`, and Keycloak's token
// endpoint returns `{error, error_description}` — so every sign-in
// failure fell through to axios's own string. The user got protocol
// noise, and whoever was debugging got no error code at all.

const {
  describeAuthFailure,
  authFailureDetail,
  oauthErrorCode,
} = require('../src/utils/authError');

const keycloakError = (status, body) => ({
  message: `Request failed with status code ${status}`,
  response: {status, data: body},
});

describe('what the USER is told', () => {
  it('never shows the raw axios/protocol string', () => {
    const msg = describeAuthFailure(
      keycloakError(401, {
        error: 'invalid_grant',
        error_description: 'Invalid user credentials',
      }),
    );
    expect(msg).not.toMatch(/status code/i);
    expect(msg).not.toMatch(/invalid_grant/);
    expect(msg).not.toMatch(/401/);
  });

  it('offers a way forward', () => {
    const msg = describeAuthFailure(
      keycloakError(401, {error: 'invalid_grant'}),
    );
    expect(msg).toMatch(/reset your password/i);
  });

  it('does NOT reveal whether the account exists', () => {
    // Account enumeration: "no account with that email" lets anyone probe
    // a list of addresses and learn who rents through Keystone. Wrong
    // email and wrong password must be indistinguishable.
    const wrongPassword = describeAuthFailure(
      keycloakError(401, {
        error: 'invalid_grant',
        error_description: 'Invalid user credentials',
      }),
    );
    const noSuchUser = describeAuthFailure(
      keycloakError(401, {
        error: 'invalid_grant',
        error_description: 'User not found',
      }),
    );
    expect(wrongPassword).toBe(noSuchUser);
    expect(wrongPassword).not.toMatch(/not found|no account|doesn't exist/i);
  });

  it('does not blame the password when the CLIENT is misconfigured', () => {
    // A tester hunting a bad password while the build is misconfigured
    // wastes the session — which is exactly what happened.
    const msg = describeAuthFailure(
      keycloakError(401, {error: 'invalid_client'}),
    );
    expect(msg).toMatch(/build|support/i);
    expect(msg).not.toMatch(/password/i);
  });

  it('distinguishes an unreachable server from a refusal', () => {
    const msg = describeAuthFailure({message: 'Network Error'});
    expect(msg).toMatch(/connection/i);
  });

  it('distinguishes a server fault from bad credentials', () => {
    const msg = describeAuthFailure(keycloakError(503, {}));
    expect(msg).not.toMatch(/password/i);
    expect(msg).toMatch(/try again/i);
  });
});

describe('what the DEVELOPER is told', () => {
  it('surfaces the Keycloak error code and description', () => {
    // The distinction that decides whether the fix is a password reset or
    // a realm/client setting — invisible from "status code 401".
    const detail = authFailureDetail(
      keycloakError(401, {
        error: 'invalid_grant',
        error_description: 'Invalid user credentials',
      }),
    );
    expect(detail).toContain('status=401');
    expect(detail).toContain('error=invalid_grant');
    expect(detail).toContain('Invalid user credentials');
  });

  it('names a client misconfiguration distinctly', () => {
    const detail = authFailureDetail(
      keycloakError(401, {
        error: 'invalid_client',
        error_description: 'Invalid client credentials',
      }),
    );
    expect(detail).toContain('error=invalid_client');
    expect(oauthErrorCode(keycloakError(401, {error: 'invalid_client'}))).toBe(
      'invalid_client',
    );
  });

  it('falls back to the transport message when there is no body', () => {
    const detail = authFailureDetail({message: 'Network Error'});
    expect(detail).toContain('no-response');
    expect(detail).toContain('Network Error');
  });
});

describe('the screen and the hook both use it', () => {
  const {read} = require('./helpers/source');

  it('Login.jsx no longer renders the raw error or asserts the email was right', () => {
    const src = read('screens/authentication/Login.jsx');
    expect(src).toMatch(/describeAuthFailure\(loginMutation\.error\)/);
    // The old fallback claimed the email matched and only the password
    // did not — an enumeration oracle in a consolation message.
    expect(src).not.toMatch(/That password doesn't match this email/);
  });

  it('useLogin logs the code and toasts the neutral copy', () => {
    const src = read('hooks/useLogin.ts');
    expect(src).toMatch(/authFailureDetail\(err\)/);
    expect(src).toMatch(/describeAuthFailure\(err\)/);
    expect(src).not.toMatch(/'Login Error: '/);
  });
});
