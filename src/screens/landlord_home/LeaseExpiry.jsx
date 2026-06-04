import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useLeaseExpiry} from '../../hooks';
import {Card, IconChip, Label, Stat, Divider, StatusPill} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Lease-expiry timeline. The action-needed flag is the load-bearing
// element — the landlord responds to flags, not lists.

const renewal = {
  SIGNED: {tone: 'success', text: 'Renewal signed'},
  SENT_NOT_SIGNED: {tone: 'pending', text: 'Renewal sent · awaiting signature'},
  NOT_SENT: {tone: 'danger', text: 'Renewal not sent · action needed'},
};

const LeaseExpiry = () => {
  const {buckets, expiring, isPending, refetch} = useLeaseExpiry();

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isPending} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        <View className="px-5 pt-6 pb-4">
          <Text className="text-keystone_navy font-inter-bold text-2xl">
            Lease Expirations
          </Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Upcoming renewals across your portfolio
          </Text>
        </View>

        {/* Bucket summary */}
        <View className="px-4">
          <Card>
            <View className="flex-row">
              <Stat label="This Month" value={`${buckets?.thisMonth ?? 0}`} sub="units" />
              <View className="w-px bg-keystone_hairline" />
              <Stat label="Next Month" value={`${buckets?.nextMonth ?? 0}`} sub="units" align="left" style={{paddingLeft: 14}} />
              <View className="w-px bg-keystone_hairline" />
              <Stat label="In 60 Days" value={`${buckets?.inSixtyDays ?? 0}`} sub="units" align="right" />
            </View>
          </Card>
        </View>

        <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-5 mt-6 mb-3">
          Expiring soon
        </Text>

        {expiring.length === 0 && !isPending && (
          <Text className="text-text_muted font-inter text-sm text-center py-10">
            No leases expiring in the next 60 days.
          </Text>
        )}

        {expiring.map(unit => {
          const r = renewal[unit.renewalStatus] ?? renewal.NOT_SENT;
          const action = unit.renewalStatus === 'NOT_SENT';
          return (
            <View key={unit.unitId} className="px-4 mb-3">
              <Card
                style={action ? {borderLeftWidth: 3, borderLeftColor: COLORS.c_danger} : null}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <IconChip size={40}>
                      <Text style={{fontSize: 15}}>📄</Text>
                    </IconChip>
                    <View className="flex-1">
                      <Text className="text-keystone_navy font-inter-semibold text-base">
                        {unit.unitName}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs mt-0.5">
                        {unit.tenantName && unit.tenantName !== '—'
                          ? `${unit.tenantName} · `
                          : ''}
                        expires {formatExpiry(unit.expiresOn)}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-keystone_navy font-inter-bold text-base">
                      {unit.daysToExpiry}
                    </Text>
                    <Text className="text-text_muted font-inter text-2xs">days</Text>
                  </View>
                </View>
                <Divider style={{marginVertical: 12}} />
                <StatusPill tone={r.tone} label={r.text} />
              </Card>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const formatExpiry = iso => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  } catch {
    return iso;
  }
};

export default LeaseExpiry;
