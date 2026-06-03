import AxiosUtility from './AxiosServices';
import {
  USE_MOBILE_MOCKS,
  mockDailyCollection,
  mockFallback,
} from './mocks';

// The morning command center datasource. BE contract documented in
// BE_ASKS_MOBILE.md §1 — single rollup endpoint so the dashboard
// doesn't fan-out N round trips on cold open.

const getDailyCollection = async () => {
  if (USE_MOBILE_MOCKS) return mockFallback('dashboard.daily-collection', mockDailyCollection);
  try {
    const {data} = await AxiosUtility.get('/dashboard/daily-collection');
    return data;
  } catch (err) {
    // BE hasn't shipped this yet (BE_ASKS_MOBILE §1). Fall back to a
    // fixture so the dashboard still renders — landlord sees something
    // representative while BE catches up.
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('dashboard.daily-collection', mockDailyCollection);
    }
    throw err;
  }
};

const DashboardServices = {
  getDailyCollection,
};

export default DashboardServices;
