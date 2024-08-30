import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Fetches all invoices
 * @param {number} page page number
 * @param {number} size size per page
 * @param {number} id agreement id
 * @returns {Promise<Invoice[]>}
 */
const getInvoices = async (page, size, id, status) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/invoices/agreement/${id}&page=${page}&size=${size}`,
  );

  return res;
};

/**
 * Fetches active invoices
 * @param {number} page page number
 * @param {number} size size per page
 * @param {string} invoiceStatus invoice status
 * @param {string} agreementStatus agreement status
 * @returns {Promise<Invoice[]>}
 */
const getActiveInvoices = async (
  page,
  size,
  invoiceStatus,
  agreementStatus,
) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/invoices/active-invoice?page=${page}&size=${size}&invoiceStatus=${invoiceStatus}&agreementStatus=${agreementStatus}`,
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

const getInvoiceAnalytics = async (page, size, propertyUnitName) => {
  setAuthToken(AxiosUtility);
  const queryParams = `?page=${page}&size=${size}`;
  let res;

  if (propertyUnitName) {
    res = await AxiosUtility.get(
      `/analytics/invoice${queryParams}&propertyUnitName=${propertyUnitName}`,
    );
  } else {
    res = await AxiosUtility.get(`/analytics/invoice${queryParams}`);
  }

  return res.data;
};

const InvoiceServices = {
  getInvoices,
  getInvoice,
  raiseConcern,
  getActiveInvoices,
  getConcerns,
  getInvoiceAnalytics,
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
