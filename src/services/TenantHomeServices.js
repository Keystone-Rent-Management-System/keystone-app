import AxiosUtility from './AxiosServices';
import {USE_MOBILE_MOCKS, mockTenantHome, mockFallback} from './mocks';

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

const TenantHomeServices = {
  getRentSummary,
};

export default TenantHomeServices;
