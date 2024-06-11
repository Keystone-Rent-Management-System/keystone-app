import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Fetches all statements
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Statement[]>}
 */
const getStatements = async (page, size) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/transactional-reports?page=${page}&size=${size}`,
  );

  return res;
};

const StatementServices = {
  getStatements,
};

/**
 * @typedef {Object} Statement
 * @property {string} id
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} createdBy
 * @property {string} modifiedBy
 * @property {boolean} deleted
 * @property {string} transactionCode
 * @property {string} accountNumber
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} phoneNumber
 * @property {number} amountCredited
 * @property {number} amountDebited
 * @property {string} methodOfPayment
 * @property {string} transactionDate
 * @property {string} bankAccountNumber
 * @property {object} propertyUnits
 */

export default StatementServices;
