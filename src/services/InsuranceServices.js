import AxiosUtility from './AxiosServices';
import {USE_MOBILE_MOCKS, mockRentInsurance, mockFallback} from './mocks';

// Rent insurance dashboard. The insurance product itself (underwriter,
// claims processor, premium billing) is a deferred business decision
// — FE doesn't care which model BE picks. We just need the read-side
// shape (BE_ASKS_MOBILE §8).

const getSummary = async () => {
  if (USE_MOBILE_MOCKS)
    return mockFallback('insurance.summary', mockRentInsurance);
  try {
    const {data} = await AxiosUtility.get('/insurance/summary');
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('insurance.summary', mockRentInsurance);
    }
    throw err;
  }
};

const InsuranceServices = {
  getSummary,
};

export default InsuranceServices;
