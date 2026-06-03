import React from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useLeaseExpiry} from '../../hooks';

// Lease-expiry timeline. The action-needed flag is the load-bearing
// element — the landlord doesn't read lists, he responds to flags.
// Anything that needs his (or his PM's) attention surfaces; the rest
// is confirmation the system is working.

const renewalLabel = {
  SIGNED: {text: 'Renewal signed ✓', cls: 'text-[#22C55E]'},
  SENT_NOT_SIGNED: {text: 'Renewal sent — not yet signed', cls: 'text-keystone_gold'},
  NOT_SENT: {text: 'Renewal NOT sent — ACTION NEEDED', cls: 'text-[#EF4444]'},
};

const LeaseExpiry = () => {
  const {buckets, expiring, isPending, refetch} = useLeaseExpiry();

  return (
    <ScrollView
      className="flex-1 bg-keystone_stone"
      refreshControl={
        <RefreshControl refreshing={isPending} onRefresh={refetch} />
      }>
      <View className="px-5 pt-6 pb-4">
        <Text className="text-keystone_navy font-inter-semibold text-xl">
          Upcoming Lease Expirations
        </Text>
      </View>

      <View className="mx-4 bg-white rounded-2xl p-5 shadow-sm">
        <BucketRow label="This Month" count={buckets?.thisMonth ?? 0} />
        <View className="h-px bg-keystone_cream my-2" />
        <BucketRow label="Next Month" count={buckets?.nextMonth ?? 0} />
        <View className="h-px bg-keystone_cream my-2" />
        <BucketRow label="In 60 Days" count={buckets?.inSixtyDays ?? 0} />
      </View>

      <View className="px-5 mt-6 mb-2">
        <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wide">
          Units Expiring Soon
        </Text>
      </View>

      {expiring.length === 0 && !isPending && (
        <Text className="text-grey_1 font-inter text-sm text-center py-10">
          No leases expiring in the next 60 days.
        </Text>
      )}

      {expiring.map(unit => {
        const status =
          renewalLabel[unit.renewalStatus] ?? renewalLabel.NOT_SENT;
        const isAction = unit.renewalStatus === 'NOT_SENT';
        return (
          <TouchableOpacity
            key={unit.unitId}
            activeOpacity={0.7}
            className={`mx-4 mb-3 bg-white rounded-2xl p-4 shadow-sm ${
              isAction ? 'border-l-4 border-[#EF4444]' : ''
            }`}>
            <View className="flex-row items-center justify-between">
              <Text className="text-keystone_navy font-inter-semibold text-base">
                {unit.unitName}
                {unit.tenantName && unit.tenantName !== '—'
                  ? ` — ${unit.tenantName}`
                  : ''}
              </Text>
              <Text className="text-grey_1 font-inter text-xs">
                {unit.daysToExpiry} day{unit.daysToExpiry === 1 ? '' : 's'}
              </Text>
            </View>
            <Text className="text-grey_1 font-inter text-xs mt-1">
              Expires {formatExpiry(unit.expiresOn)}
            </Text>
            <Text className={`mt-2 font-inter-semibold text-xs ${status.cls}`}>
              {status.text}
            </Text>
          </TouchableOpacity>
        );
      })}

      <View className="h-8" />
    </ScrollView>
  );
};

const BucketRow = ({label, count}) => (
  <View className="flex-row items-center justify-between py-1">
    <Text className="text-grey_1 font-inter text-sm">{label}</Text>
    <Text className="text-keystone_navy font-inter-bold text-base">
      {count} unit{count === 1 ? '' : 's'}
    </Text>
  </View>
);

const formatExpiry = iso => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

export default LeaseExpiry;
