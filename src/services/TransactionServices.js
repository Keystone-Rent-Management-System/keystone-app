import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Fetches all transactions
 * @param {number} page
 * @param {number} size
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Transaction[]>}
 */
const getTransactions = async (page, size, startDate, endDate) => {
  setAuthToken(AxiosUtility);
  const queryParams = `?page=${page}&size=${size}`;
  let res;

  if (startDate && startDate !== 'Select period') {
    const dateParams = `&startDate=${startDate}&endDate=${endDate}`;
    res = await AxiosUtility.get(
      `/transactional-reports${queryParams}${dateParams}`,
    );
  } else {
    res = await AxiosUtility.get(`/transactional-reports${queryParams}`);
  }

  return res.data;
};

/**
 * Fetches tenant transactions
 * @param {number} page
 * @param {number} size
 * @param {string} userId
 * @returns {Promise<Transaction[]>}
 */
const getTenantTransactions = async (page, size, userId) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/transactions/tenant-transactions?page=${page}&size=${size}&tenantUserId=${userId}`,
  );

  return res;
};

/**
 * Fetches all transactions comming in
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Transaction[]>}
 */
const getTransactionsIn = async (page, size) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/transactions/money-in?page=${page}&size=${size}`,
  );

  return res;
};

/**
 * Fetches all transactions moving out
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Transaction[]>}
 */
const getTransactionsOut = async (page, size) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/transactions/money-out?page=${page}&size=${size}`,
  );

  return res;
};

const getTotalTransactions = async () => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    '/transactions/total-transactions',
  );
  return res;
};

const TransactionServices = {
  getTransactions,
  getTenantTransactions,
  getTransactionsIn,
  getTransactionsOut,
  getTotalTransactions,
};

export default TransactionServices;
