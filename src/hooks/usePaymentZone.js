import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import PaymentZoneServices from '../services/PaymentZoneServices';

// ── PAYMENT_ZONES (mobile) ─────────────────────────────────────────
// Single source of truth for bucket label, color, accent glyph.
// Mirrors the landlord SPA's PAYMENT_ZONES constant — keep these
// aligned so cross-platform reads identically.
//
// The user spec calls for traffic-light colors specifically:
//   🟢 EARLY   71%
//   🔵 ON TIME 19%
//   🟡 LATE     7%
//   🔴 NOT PAID 3%
//
// Web SPA uses 'Green/Purple/Yellow/Red'. Mobile follows the user's
// 'Green/Blue/Yellow/Red' spec since this is what the landlord sees.
export const PAYMENT_ZONES = [
  {
    key: 'early',
    label: 'EARLY',
    description: 'Paid in advance',
    color: '#22C55E',
    glyph: '🟢',
  },
  {
    key: 'onTime',
    label: 'ON TIME',
    description: 'Paid on due date',
    color: '#3B82F6',
    glyph: '🔵',
  },
  {
    key: 'late',
    label: 'LATE',
    description: 'Within allowed period',
    color: '#F59E0B',
    glyph: '🟡',
  },
  {
    key: 'notPaid',
    label: 'NOT PAID',
    description: 'Overdue',
    color: '#EF4444',
    glyph: '🔴',
  },
];

const VALID_KEYS = new Set(PAYMENT_ZONES.map(z => z.key));

export const usePaymentZones = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['payment-zones'],
    queryFn: () => PaymentZoneServices.getPaymentZones(),
  });

  const summary = useMemo(() => {
    if (!data) return [];
    return PAYMENT_ZONES.map(zone => ({
      ...zone,
      count: data[zone.key]?.count ?? data[zone.key]?.tenants?.length ?? 0,
    }));
  }, [data]);

  const total = useMemo(
    () => summary.reduce((acc, z) => acc + z.count, 0),
    [summary],
  );

  return {isPending, error, paymentZones: data, summary, total, refetch};
};

export const useZoneTenants = bucketKey => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['payment-zones'],
    queryFn: () => PaymentZoneServices.getPaymentZones(),
  });
  const tenants = useMemo(() => {
    if (!data || !VALID_KEYS.has(bucketKey)) return [];
    return data[bucketKey]?.tenants ?? [];
  }, [data, bucketKey]);
  return {isPending, error, tenants, refetch};
};
