import AxiosUtility, {setAuthToken} from './AxiosServices';
import {PAGINATION_LIMIT} from '../constants';

/**
 * Fetches all invoices
 * @param {number} page page number
 * @param {number} size size per page
 * @param {string} status invoice status
 * @param {string} userId current user id
 * @returns {Promise<Invoice[]>}
 */
const getInvoices = async (page, size = PAGINATION_LIMIT, status, userId) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/invoices/tenant-invoice?page=${page}&size=${size}&paymentStatus=${status}&tenantUserId=${userId}`,
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

const getInvoiceAnalytics = async (
  page,
  size = PAGINATION_LIMIT,
  propertyUnitName,
) => {
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
