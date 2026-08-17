import AxiosUtility from './AxiosServices';
import {isEndpointUnavailable} from './unavailable';
import {USE_MOBILE_MOCKS, mockLeaseExpiries, mockFallback} from './mocks';

// Lease-expiry timeline. BE today exposes agreements with endDate +
// renewalSentAt, but no aggregate "expiries in next 60 days" rollup.
// Until BE_ASKS_MOBILE §7 ships, this service either calls a real
// rollup endpoint OR falls through to a client-side aggregator
// reading the agreement list.

const getExpiringLeases = async () => {
  if (USE_MOBILE_MOCKS) return mockFallback('lease-expiries', mockLeaseExpiries);
  try {
    // Preferred — BE rollup.
    const {data} = await AxiosUtility.get('/agreements/expiring');
    return data;
  } catch (err) {
    if (isEndpointUnavailable(err)) {
      // Fall back: pull the agreement list and roll up client-side.
      try {
        const {data: agreements} = await AxiosUtility.get(
          '/search/agreements?page=0&size=200',
        );
        return rollupExpiriesClientSide(agreements?.content ?? []);
      } catch {
        return mockFallback('lease-expiries', mockLeaseExpiries);
      }
    }
    throw err;
  }
};

const rollupExpiriesClientSide = agreements => {
  const today = new Date();
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const sixtyDays = new Date(today);
  sixtyDays.setDate(sixtyDays.getDate() + 60);

  const buckets = {thisMonth: 0, nextMonth: 0, inSixtyDays: 0};
  const expiring = [];

  for (const a of agreements) {
    const end = a.endDate ? new Date(a.endDate) : null;
    if (!end || end < today) continue;
    const daysToExpiry = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (daysToExpiry > 60) continue;

    if (end <= thisMonthEnd) buckets.thisMonth++;
    else if (end <= nextMonthEnd) buckets.nextMonth++;
    else buckets.inSixtyDays++;

    expiring.push({
      unitId: a.unitId,
      unitName: a.unitName ?? a.propertyName ?? a.unitId,
      tenantName: a.tenantName ?? '—',
      expiresOn: a.endDate,
      daysToExpiry,
      renewalStatus: a.renewalSentAt
        ? a.renewalSignedAt
          ? 'SIGNED'
          : 'SENT_NOT_SIGNED'
        : 'NOT_SENT',
    });
  }
  expiring.sort((x, y) => x.daysToExpiry - y.daysToExpiry);
  return {buckets, expiring};
};

const LeaseExpiryServices = {
  getExpiringLeases,
};

export default LeaseExpiryServices;
