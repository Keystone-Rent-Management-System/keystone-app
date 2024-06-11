import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Fetches all invoices
 * @param {number} page page number
 * @param {number} size size per page
 * @returns {Promise<Invoice[]>}
 */
const getInvoices = async (page, size, status) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/invoices?status=${status}&page=${page}&size=${size}`,
  );

  return res;
};

/**
 * Fetches specific invoice
 * @param {string} id
 * @returns {Promise<Invoice>}
 */
const getInvoice = async id => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(`/invoices/${id}`);

  return res;
};

const raiseConcern = async (id, data) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.post(
    `/invoices/${id}/raise-concern`,
    data,
  );

  return res;
};

const getConcerns = async (id, data) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/invoices/${id}/invoice-concerns`,
    data,
  );

  return res;
};

const InvoiceServices = {
  getInvoices,
  getInvoice,
  raiseConcern,
  getConcerns,
};

export default InvoiceServices;

/**
 * @typedef {{
 *   first: boolean,
 *   last: boolean,
 *   totalPages: number,
 *   totalElements: number,
 *   numberOfElements: number,
 *   number: number,
 *   content:CreatedLandlord[]
 *  }} InvoiceResponse
 */
