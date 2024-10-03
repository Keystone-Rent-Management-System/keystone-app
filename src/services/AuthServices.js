import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Verifies registering tenant's email
 * @param {string} email
 * @returns {Promise<any>}
 */
const verifyRegisteringEmail = async data => {
  const {data: res} = await AxiosUtility.post(
    '/profile/email-verification',
    data,
  );

  return res;
};

/**
 * registers tenant
 * @param {NewTenant} data
 * @returns {Promise<any>}
 */
const registerTenant = async data => {
  const {data: res} = await AxiosUtility.post('/profile/tenant', data);

  return res;
};

/**
 * signs in tenant
 * @param {User} data
 * @returns {Promise<any>}
 */
const login = async data => {
  const {data: res} = await AxiosUtility.post('/profile/login', data);

  return res;
};

/**
 * get password reset token
 * @param {Email} data
 */
const getResetPasswordToken = async data => {
  const {data: res} = await AxiosUtility.post(
    '/profile/reset-password-token',
    data,
  );

  return res;
};

/**
 * reset password
 * @param {ResetPassword} data
 */
const resetPassword = async data => {
  const {data: res} = await AxiosUtility.put('/profile/reset-password', data);

  return res;
};

/**
 * Gets tenant profile
 * @returns {Promise<any>}
 */
const getProfile = async data => {
  setAuthToken(AxiosUtility);

  const {data: res} = await AxiosUtility.get('/manage-profile/me', data);

  return res;
};

/**
 * Update logged in tenant password
 * @returns {Promise<Object>}
 */
const updateUserPassword = async data => {
  const {data: res} = await AxiosUtility.put(
    '/manage-profile/change-password',
    data,
  );

  return res;
};

/**
 * Refreshes token upon expiration
 * @param {string} refreshTkn
 * @returns {Promise<any>}
 */
const refreshToken = async refreshTkn => {
  const {data: res} = await AxiosUtility.post('/profile/refresh-token', {
    refreshToken: refreshTkn,
  });

  return res;
};

const AuthServices = {
  verifyRegisteringEmail,
  registerTenant,
  login,
  getResetPasswordToken,
  resetPassword,
  getProfile,
  updateUserPassword,
  refreshToken,
};

export default AuthServices;

/**
 * @typedef {{
 * "firstName": "string",
 * "lastName": "string",
 * "email": "string",
 * "phoneNumber": "string",
 * "identificationType": "NATIONAL_ID",
 * "identificationNumber": "string",
 * "token": "string",
 * "password": "string"
 * }} NewTenant
 */

/**
 * @typedef {{
 * "email": "string",
 * "password": "string"
 * }} User signining in user
 */

/**
 * @typedef {{
 * "email": "string"
 * }} Email
 */

/**
 * @typedef {{
 * "email": "string",
 * "token": "string",
 * "password": "string"
 * }} ResetPassword
 */
