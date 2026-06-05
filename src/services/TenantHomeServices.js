import AxiosUtility from './AxiosServices';
import {
  USE_MOBILE_MOCKS,
  mockTenantHome,
  mockTenantPayments,
  mockTenantStatement,
  mockFallback,
} from './mocks';

// The tenant's rent command center datasource. One rollup so the home
// screen doesn't fan out (agreement + statement + invoices + payments)
// on cold open. BE contract: GET /tenants/rent-summary — not yet
// shipped (BE_ASKS_MOBILE), so this falls back to a fixture.

const getRentSummary = async () => {
  if (USE_MOBILE_MOCKS) {
    return mockFallback('tenant.rent-summary', mockTenantHome);
  }
  try {
    const {data} = await AxiosUtility.get('/tenants/rent-summary');
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('tenant.rent-summary', mockTenantHome);
    }
    throw err;
  }
};

// Full payment history (receipts). GET /tenants/payments
const getPayments = async () => {
  if (USE_MOBILE_MOCKS) {
    return mockFallback('tenant.payments', mockTenantPayments);
  }
  try {
    const {data} = await AxiosUtility.get('/tenants/payments');
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('tenant.payments', mockTenantPayments);
    }
    throw err;
  }
};

// Rent ledger (charges/credits). GET /tenants/statement
const getStatement = async () => {
  if (USE_MOBILE_MOCKS) {
    return mockFallback('tenant.statement', mockTenantStatement);
  }
  try {
    const {data} = await AxiosUtility.get('/tenants/statement');
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('tenant.statement', mockTenantStatement);
    }
    throw err;
  }
};

const TenantHomeServices = {
  getRentSummary,
  getPayments,
  getStatement,
};

export default TenantHomeServices;
