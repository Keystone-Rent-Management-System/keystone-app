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

const getTotalTransactions = async () => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    '/transactions/total-transactions',
  );
  return res;
};

const TransactionServices = {
  getTransactions,
  getTotalTransactions,
};

export default TransactionServices;
