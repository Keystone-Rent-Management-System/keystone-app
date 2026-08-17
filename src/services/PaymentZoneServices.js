import AxiosUtility from './AxiosServices';
import {isEndpointUnavailable} from './unavailable';
import {USE_MOBILE_MOCKS, mockPaymentZones, mockFallback} from './mocks';

// Mirrors the landlord SPA's PaymentZoneServices. BE doc §5.12 —
// `/payment-zones` returns the four-bucket dict
// {early, onTime, late, notPaid}.

const getPaymentZones = async () => {
  if (USE_MOBILE_MOCKS) return mockFallback('payment-zones', mockPaymentZones);
  try {
    const {data} = await AxiosUtility.get('/payment-zones');
    return data;
  } catch (err) {
    if (isEndpointUnavailable(err)) {
      return mockFallback('payment-zones', mockPaymentZones);
    }
    throw err;
  }
};

const PaymentZoneServices = {
  getPaymentZones,
};

export default PaymentZoneServices;
