import AxiosUtility from './AxiosServices';
import {
  USE_MOBILE_MOCKS,
  mockMaintenanceSummary,
  mockFallback,
} from './mocks';

// Maintenance visibility (read-only). The landlord does NOT manage
// maintenance from this app — that's his PM's job. This service
// surfaces counts and the overdue flag so he knows nothing is falling
// through the cracks. BE contract (BE_ASKS_MOBILE §6):
//   GET /maintenance/summary
// Returns counts (openRequests, inProgress, awaitingParts, overdue)
// plus an overdueDetails array for the drill-down.

const getSummary = async () => {
  if (USE_MOBILE_MOCKS)
    return mockFallback('maintenance.summary', mockMaintenanceSummary);
  try {
    const {data} = await AxiosUtility.get('/maintenance/summary');
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('maintenance.summary', mockMaintenanceSummary);
    }
    throw err;
  }
};

const MaintenanceServices = {
  getSummary,
};

export default MaintenanceServices;
