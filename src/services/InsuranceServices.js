import AxiosUtility from './AxiosServices';
import {isEndpointUnavailable} from './unavailable';
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
    if (isEndpointUnavailable(err)) {
      return mockFallback('insurance.summary', mockRentInsurance);
    }
    throw err;
  }
};

const InsuranceServices = {
  getSummary,
};

export default InsuranceServices;
