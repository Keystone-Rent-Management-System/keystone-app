import AxiosUtility from './AxiosServices';
import {isEndpointUnavailable} from './unavailable';
import {
  USE_MOBILE_MOCKS,
  mockTenantHome,
  mockTenantPayments,
  mockTenantStatement,
  mockTenantRepairs,
  mockTenantChecklist,
  mockTenantInsurance,
  mockFallback,
} from './mocks';

// Small helper: try a GET, fall back to a fixture when the gateway
// can't serve the rollup (see ./unavailable for exactly which statuses
// count, and why 401 is not one of them).
const getOrMock = async (url, key, fixture) => {
  if (USE_MOBILE_MOCKS) {
    return mockFallback(key, fixture);
  }
  try {
    const {data} = await AxiosUtility.get(url);
    return data;
  } catch (err) {
    if (isEndpointUnavailable(err)) {
      return mockFallback(key, fixture);
    }
    throw err;
  }
};

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
    if (isEndpointUnavailable(err)) {
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
    if (isEndpointUnavailable(err)) {
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
    if (isEndpointUnavailable(err)) {
      return mockFallback('tenant.statement', mockTenantStatement);
    }
    throw err;
  }
};

// Repair requests (feeds the landlord's read-only maintenance view).
const getRepairs = () =>
  getOrMock('/tenants/repairs', 'tenant.repairs', mockTenantRepairs);

// Move-in / move-out condition checklist (feeds the deposit baseline).
const getChecklist = () =>
  getOrMock('/tenants/checklist', 'tenant.checklist', mockTenantChecklist);

// Renters insurance coverage.
const getInsurance = () =>
  getOrMock('/tenants/insurance', 'tenant.insurance', mockTenantInsurance);

const TenantHomeServices = {
  getRentSummary,
  getPayments,
  getStatement,
  getRepairs,
  getChecklist,
  getInsurance,
};

export default TenantHomeServices;
