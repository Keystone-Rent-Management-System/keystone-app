import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Fetches all statements
 * @param {number} page
 * @param {number} size
 * @param {string} year
 * @returns {Promise<Statement[]>}
 */
const getStatements = async (page, size, year) => {
  setAuthToken(AxiosUtility);
  const queryParams = `?page=${page}&size=${size}`;
  let res;

  if (year && year !== 'All') {
    const yearParams = `&startDate=${year}-01-01&endDate=${year}-12-31`;
    res = await AxiosUtility.get(
      `/transactional-reports${queryParams}${yearParams}`,
    );
  } else {
    res = await AxiosUtility.get(`/transactional-reports${queryParams}`);
  }

  return res.data;
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
