import AxiosUtility from './AxiosServices';

/**
 * Fetches all agreements
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Agreement[]>}
 */
const getAgreements = async (page, size) => {
  try {
    const {data: res} = await AxiosUtility.get(
      `/agreements?page=${page}&size=${size}`,
    );
    return res;
  } catch (error) {
    throw new Error('Failed to fetch agreements');
  }
};

/**
 * Fetches single agreement
 * @param {number} id
 * @returns {Promise<Agreement>}
 */
const getAgreement = async id => {
  try {
    const {data: res} = await AxiosUtility.get(`/agreements/${id}`);
    return res;
  } catch (error) {
    throw new Error('Failed to fetch agreement');
  }
};

const AgreementServices = {
  getAgreements,
  getAgreement,
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
