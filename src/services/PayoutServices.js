import AxiosUtility from './AxiosServices';
import {USE_MOBILE_MOCKS, mockPayoutBalance, mockFallback} from './mocks';

// Instant Payout — pulls the landlord's available balance and
// triggers FedNow transfers. BE contract (BE_ASKS_MOBILE §4):
//   GET    /payouts/balance        → {available, currency, bank}
//   POST   /payouts/send           → {transferId, status, ETA}
//   GET    /payouts/auto           → {enabled, cadence}
//   PATCH  /payouts/auto           → {enabled, cadence}
//
// FedNow target ETA is "under 60 seconds" — UI shows a spinner with
// that copy. If BE responds with a Dwolla transferId, we display it
// in the success state for traceability.

const getBalance = async () => {
  if (USE_MOBILE_MOCKS) return mockFallback('payouts.balance', mockPayoutBalance);
  try {
    const {data} = await AxiosUtility.get('/payouts/balance');
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('payouts.balance', mockPayoutBalance);
    }
    throw err;
  }
};

const sendToBank = async (amount = null) => {
  if (USE_MOBILE_MOCKS) {
    return mockFallback('payouts.send', {
      transferId: 'mock-fednow-' + Date.now(),
      status: 'PROCESSING',
      etaSeconds: 60,
    });
  }
  try {
    const {data} = await AxiosUtility.post('/payouts/send', {amount});
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501) {
      return mockFallback('payouts.send', {
        transferId: 'mock-fednow-' + Date.now(),
        status: 'PROCESSING',
        etaSeconds: 60,
      });
    }
    throw err;
  }
};

const setAutoPayout = async ({enabled, cadence}) => {
  if (USE_MOBILE_MOCKS) {
    return mockFallback('payouts.auto', {enabled, cadence});
  }
  try {
    const {data} = await AxiosUtility.patch('/payouts/auto', {enabled, cadence});
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501) {
      return mockFallback('payouts.auto', {enabled, cadence});
    }
    throw err;
  }
};

const PayoutServices = {
  getBalance,
  sendToBank,
  setAutoPayout,
};

export default PayoutServices;
