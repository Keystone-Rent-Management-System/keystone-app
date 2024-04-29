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
 * Gets tenant profile
 * @returns {Promise<any>}
 */
const getProfile = async data => {
  setAuthToken(AxiosUtility);

  const {data: res} = await AxiosUtility.get('/manage-profile/me', data);

  return res;
};

const AuthServices = {
  verifyRegisteringEmail,
  registerTenant,
  login,
  getProfile,
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
