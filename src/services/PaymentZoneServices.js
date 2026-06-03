import AxiosUtility from './AxiosServices';
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
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('payment-zones', mockPaymentZones);
    }
    throw err;
  }
};

const PaymentZoneServices = {
  getPaymentZones,
};

export default PaymentZoneServices;
