import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Fetches all agreements
 * @param {number} page
 * @param {number} size
 * @returns {Promise<{content:Agreement[],page:any}>}
 */
const getAgreements = async (page, size) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/tenants/agreements?page=${page}&size=${size}`,
  );

  return res;
};

/**
 * Fetches active agreement
 * @returns {Promise<Agreement>}
 */
const getActiveAgreement = async () => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    '/tenants/current-active-agreement',
  );

  return res;
};

/**
 * Accept agreement
 * @param {number|string} id
 * @returns {Promise<Agreement>}
 */
const acceptAgreement = async id => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.patch(`/agreements/${id}/acceptance`);

  return res;
};

/**
 * Terminate agreement
 * @param {number} id
 * @returns {Promise<Agreement>}
 */
const terminateAgreement = async id => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.patch(`/agreements/${id}/terminate`);

  return res;
};

const sendTerminationNotice = async data => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.post('/vacate-notice', data);

  return res;
};

const AgreementServices = {
  getAgreements,
  getActiveAgreement,
  acceptAgreement,
  terminateAgreement,
  sendTerminationNotice,
};

/**
 * @typedef {Object} Agreement
 * @property {string} id
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} createdBy
 * @property {string} modifiedBy
 * @property {boolean} deleted
 * @property {string} userId
 * @property {string} status
 * @property {string} tenancyBeginningDate
 * @property {number} rentDueDate
 * @property {number} daysOfTerminationNotice
 * @property {number} daysOfTerminationAfterAgreementBreach
 * @property {number} daysOfDepositRefundAfterTermination
 * @property {object} tenants
 */

export default AgreementServices;
