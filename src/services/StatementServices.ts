import {IFromEndDate} from '../utils/statement';
import AxiosUtility, {setAuthToken} from './AxiosServices';

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
export interface Statement {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string;
  deleted: boolean;
  transactionCode: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  amountCredited: number;
  amountDebited: number;
  methodOfPayment: string;
  transactionDate: string;
  bankAccountNumber: string;
  propertyUnits: object;
}

/**
 * Fetches all statements
 * @param {string} agreementId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Statement[]>}
 */
const getStatements = async (
  agreementId: string,
  page: number,
  size: number,
): Promise<Statement[]> => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/statements/tenantStatements?agreementId=${agreementId}&page=${page}&size=${size}`,
  );

  return res;
};

const fetchCurrentStatement = async (
  agreementId: string,
): Promise<Statement> => {
  setAuthToken(AxiosUtility);

  const {data: res} = await AxiosUtility.get(
    `/statements/currentStatement?agreementId=${agreementId}`,
  );

  return res;
};

async function getFilteredStatements(dateRange: IFromEndDate) {
  setAuthToken(AxiosUtility);
  console.log('HITT:::', dateRange);

  const {data: res} = await AxiosUtility.get(
    `/statements/currentStatement?startDate=${dateRange.from}&endDate=${dateRange.to}`,
  );

  return res;
}

const StatementServices = {
  getStatements,
  fetchCurrentStatement,
  getFilteredStatements,
};

export default StatementServices;
