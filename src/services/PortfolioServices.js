import AxiosUtility from './AxiosServices';
import {
  USE_MOBILE_MOCKS,
  mockPortfolioPerformance,
  mockFallback,
} from './mocks';

// Portfolio performance rollup. Replaces the Excel file the landlord
// hands to his accountant. BE contract (BE_ASKS_MOBILE §5):
//   GET /portfolio/performance?period=YYYY-MM
// Returns: gross rent, vacancy loss, late fees, insurance claims,
// net collected, occupancy rate, average days to pay, on-time rate,
// vs last month / last year deltas.

const getPerformance = async (period = null) => {
  if (USE_MOBILE_MOCKS)
    return mockFallback('portfolio.performance', mockPortfolioPerformance);
  const qs = period ? `?period=${period}` : '';
  try {
    const {data} = await AxiosUtility.get(`/portfolio/performance${qs}`);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('portfolio.performance', mockPortfolioPerformance);
    }
    throw err;
  }
};

// PDF export. BE returns a signed S3 URL the FE can hand to the
// system share sheet — same pattern as the landlord SPA's Statement
// PDF flow. Until BE ships, FE shows a "preparing PDF…" toast and
// fails gracefully.
const exportPerformancePdf = async (period = null) => {
  const qs = period ? `?period=${period}` : '';
  try {
    const {data} = await AxiosUtility.get(`/portfolio/performance/pdf${qs}`);
    return data;
  } catch (err) {
    return mockFallback('portfolio.performance.pdf', {
      url: null,
      message: 'PDF export endpoint not yet shipped — coming soon',
    });
  }
};

const PortfolioServices = {
  getPerformance,
  exportPerformancePdf,
};

export default PortfolioServices;
