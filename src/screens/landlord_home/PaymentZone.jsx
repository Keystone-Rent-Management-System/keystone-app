import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  PAYMENT_ZONES,
  usePaymentZones,
  useZoneTenants,
} from '../../hooks';
import {usePayoutBalance} from '../../hooks/usePayout';
import {pct, usdCents} from '../../utils/money';

// Tenant rent-status bucket view. Top card shows the four-bucket
// summary; tap a bucket → drill-down modal lists every tenant in
// that bucket with what Keystone has already automated on their
// behalf (reminder sent, late fee applied, insurance claim opened).

const PaymentZone = () => {
  const {summary, total, isPending, refetch} = usePaymentZones();
  const {balance} = usePayoutBalance();
  const [drilldown, setDrilldown] = useState(null);
  const nav = useNavigation();

  return (
    <ScrollView
      className="flex-1 bg-keystone_stone"
      refreshControl={
        <RefreshControl refreshing={isPending} onRefresh={refetch} />
      }>
      <View className="px-5 pt-6 pb-4">
        <Text className="text-keystone_navy font-inter-semibold text-xl">
          Tenant Payment Status
        </Text>
        <Text className="text-grey_1 font-inter text-sm mt-1">
          Tap any status to see who
        </Text>
      </View>

      {/* Quick Payout chip — surfaces the Instant Payout call-to-action
          right under the bucket table since this is where the landlord
          looks to see "what's mine to move". */}
      {balance?.available > 0 && (
        <TouchableOpacity
          onPress={() => nav.navigate('payout')}
          activeOpacity={0.85}
          className="mx-4 mb-3 bg-keystone_gold/15 rounded-2xl p-4 flex-row items-center justify-between">
          <View>
            <Text className="text-grey_1 font-inter text-xs uppercase tracking-wider">
              Available to payout
            </Text>
            <Text className="text-keystone_navy font-inter-bold text-xl mt-1">
              {usdCents(balance.available)}
            </Text>
          </View>
          <View className="bg-keystone_navy rounded-full px-4 py-2">
            <Text className="text-white font-inter-semibold text-xs uppercase">
              Send to Bank
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <View className="mx-4 bg-white rounded-2xl p-4 shadow-sm">
        {summary.map((zone, idx) => (
          <View key={zone.key}>
            <TouchableOpacity
              onPress={() => setDrilldown(zone.key)}
              activeOpacity={0.6}
              className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center gap-3 flex-1">
                <View
                  style={{backgroundColor: zone.color}}
                  className="w-3 h-3 rounded-full"
                />
                <View className="flex-1">
                  <Text className="text-keystone_navy font-inter-semibold text-base">
                    {zone.label}
                  </Text>
                  <Text className="text-grey_1 font-inter text-xs">
                    {zone.description}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-keystone_navy font-inter-bold text-lg">
                  {zone.count}
                </Text>
                <Text className="text-grey_1 font-inter text-xs">
                  {total > 0 ? pct((zone.count / total) * 100) : '0%'}
                </Text>
              </View>
            </TouchableOpacity>
            {idx < summary.length - 1 && (
              <View className="h-px bg-keystone_cream" />
            )}
          </View>
        ))}
      </View>

      <Text className="mx-5 mt-4 text-grey_1 font-inter text-xs">
        Total tracked: {total} tenant{total === 1 ? '' : 's'}
      </Text>

      <TenantDrilldownModal
        bucketKey={drilldown}
        onClose={() => setDrilldown(null)}
      />
    </ScrollView>
  );
};

const TenantDrilldownModal = ({bucketKey, onClose}) => {
  const zone = PAYMENT_ZONES.find(z => z.key === bucketKey);
  const {tenants, isPending} = useZoneTenants(bucketKey);

  return (
    <Modal
      visible={!!bucketKey}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/40 justify-end"
        onPress={onClose}>
        <Pressable
          onPress={e => e.stopPropagation()}
          className="bg-keystone_stone rounded-t-3xl pt-3 pb-8 max-h-[85%]">
          <View className="items-center pb-3">
            <View className="w-12 h-1 bg-keystone_cream rounded-full" />
          </View>
          <View className="px-5 pb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View
                style={{backgroundColor: zone?.color}}
                className="w-3 h-3 rounded-full"
              />
              <Text className="text-keystone_navy font-inter-semibold text-lg">
                {zone?.label}
              </Text>
            </View>
            <Text className="text-grey_1 font-inter text-sm">
              {tenants.length} tenant{tenants.length === 1 ? '' : 's'}
            </Text>
          </View>
          <ScrollView className="px-3">
            {tenants.length === 0 && !isPending && (
              <Text className="text-grey_1 font-inter text-sm text-center py-10">
                No tenants in this bucket — that's a good thing.
              </Text>
            )}
            {tenants.map(t => (
              <View
                key={t.id}
                className="bg-white rounded-xl p-4 mb-2 mx-2 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <Text className="text-keystone_navy font-inter-semibold text-base flex-1">
                    {t.name}
                  </Text>
                  {bucketKey === 'notPaid' && t.daysOverdue > 0 && (
                    <View className="bg-[#EF4444]/10 px-2 py-1 rounded">
                      <Text className="text-[#EF4444] font-inter-semibold text-xs">
                        {t.daysOverdue}d overdue
                      </Text>
                    </View>
                  )}
                  {bucketKey === 'late' && t.daysOverdue > 0 && (
                    <View className="bg-[#F59E0B]/10 px-2 py-1 rounded">
                      <Text className="text-[#F59E0B] font-inter-semibold text-xs">
                        {t.daysOverdue}d late
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-grey_1 font-inter text-xs mt-1">
                  {t.unitName}
                </Text>
                {t.lastAction && (
                  <View className="mt-2 pt-2 border-t border-keystone_cream">
                    <Text className="text-keystone_gold font-inter text-xs">
                      ✓ {t.lastAction}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PaymentZone;
