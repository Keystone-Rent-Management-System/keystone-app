import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {PAYMENT_ZONES, usePaymentZones, useZoneTenants} from '../../hooks';
import {usePayoutBalance} from '../../hooks/usePayout';
import {pct, usdCents} from '../../utils/money';
import {Card, IconChip, Avatar, Label, Amount, Divider, StatusPill, Donut} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Tenant rent-status buckets. Top: a navy feature strip with the
// available-payout call-to-action; then the four-bucket table; tap a
// bucket → drill-down sheet listing tenants + what Keystone has
// already automated on their behalf.

const PaymentZone = () => {
  const {summary, total, isPending, refetch} = usePaymentZones();
  const {balance} = usePayoutBalance();
  const [drilldown, setDrilldown] = useState(null);
  const nav = useNavigation();

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
            Payments
          </Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            {total} tenant{total === 1 ? '' : 's'} tracked · tap a status to see who
          </Text>
        </View>

        {/* Payout feature strip */}
        {balance?.available > 0 && (
          <View className="px-4 mb-4">
            <Card feature>
              <View className="flex-row items-center justify-between">
                <View>
                  <Label onDark>Available to payout</Label>
                  <Amount size="lg" onDark style={{marginTop: 6}}>
                    {usdCents(balance.available)}
                  </Amount>
                </View>
                <TouchableOpacity
                  onPress={() => nav.navigate('payout')}
                  activeOpacity={0.85}
                  className="bg-keystone_gold rounded-full px-5 py-2.5">
                  <Text className="text-keystone_navy font-inter-semibold text-xs uppercase tracking-wider">
                    Send to bank
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Donut overview */}
        {total > 0 && (
          <View className="px-4 mb-4">
            <Card>
              <View className="flex-row items-center">
                <Donut
                  size={150}
                  thickness={20}
                  centerValue={total}
                  centerLabel="tenants"
                  data={summary.map(z => ({value: z.count, color: z.color}))}
                />
                <View className="flex-1 pl-4">
                  {summary.map(z => (
                    <View key={z.key} className="flex-row items-center justify-between py-1.5">
                      <View className="flex-row items-center gap-2 flex-1">
                        <View style={{backgroundColor: z.color}} className="w-2.5 h-2.5 rounded-full" />
                        <Text className="text-keystone_navy font-inter-medium text-xs">
                          {z.label}
                        </Text>
                      </View>
                      <Text className="text-keystone_navy font-inter-bold text-sm">
                        {z.count}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Bucket table */}
        <View className="px-4">
          <Card style={{padding: 6}}>
            {summary.map((zone, idx) => (
              <View key={zone.key}>
                <TouchableOpacity
                  onPress={() => setDrilldown(zone.key)}
                  activeOpacity={0.6}
                  className="flex-row items-center justify-between px-3 py-3.5">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View style={{backgroundColor: zone.color}} className="w-2.5 h-2.5 rounded-full" />
                    <View className="flex-1">
                      <Text className="text-keystone_navy font-inter-semibold text-base">
                        {zone.label}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs">
                        {zone.description}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end flex-row gap-3">
                    <View className="items-end">
                      <Text className="text-keystone_navy font-inter-bold text-lg">
                        {zone.count}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs">
                        {total > 0 ? pct((zone.count / total) * 100) : '0%'}
                      </Text>
                    </View>
                    <Text className="text-text_muted font-inter-semibold">›</Text>
                  </View>
                </TouchableOpacity>
                {idx < summary.length - 1 && <Divider style={{marginHorizontal: 12}} />}
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      <TenantDrilldown bucketKey={drilldown} onClose={() => setDrilldown(null)} />
    </View>
  );
};

const TenantDrilldown = ({bucketKey, onClose}) => {
  const zone = PAYMENT_ZONES.find(z => z.key === bucketKey);
  const {tenants, isPending} = useZoneTenants(bucketKey);

  const initials = name =>
    (name ?? '')
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <Modal visible={!!bucketKey} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable
          onPress={e => e.stopPropagation()}
          className="bg-keystone_canvas rounded-t-3xl pt-3 pb-8 max-h-[85%]">
          <View className="items-center pb-3">
            <View className="w-10 h-1 bg-keystone_hairline rounded-full" />
          </View>
          <View className="px-5 pb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View style={{backgroundColor: zone?.color}} className="w-3 h-3 rounded-full" />
              <Text className="text-keystone_navy font-inter-bold text-lg">
                {zone?.label}
              </Text>
            </View>
            <Text className="text-text_muted font-inter text-sm">
              {tenants.length} tenant{tenants.length === 1 ? '' : 's'}
            </Text>
          </View>
          <ScrollView className="px-4">
            {tenants.length === 0 && !isPending && (
              <Text className="text-text_muted font-inter text-sm text-center py-10">
                No tenants in this bucket — that's a good thing.
              </Text>
            )}
            {tenants.map(t => (
              <Card key={t.id} style={{marginBottom: 10, padding: 14}}>
                <View className="flex-row items-center gap-3">
                  <Avatar initials={initials(t.name)} size={40} />
                  <View className="flex-1">
                    <Text className="text-keystone_navy font-inter-semibold text-base">
                      {t.name}
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      {t.unitName}
                    </Text>
                  </View>
                  {bucketKey === 'notPaid' && t.daysOverdue > 0 && (
                    <StatusPill tone="danger" label={`${t.daysOverdue}d overdue`} />
                  )}
                  {bucketKey === 'late' && t.daysOverdue > 0 && (
                    <StatusPill tone="pending" label={`${t.daysOverdue}d late`} />
                  )}
                </View>
                {t.lastAction && (
                  <View className="mt-3 pt-3 border-t border-keystone_hairline flex-row items-center gap-2">
                    <Text className="text-keystone_gold">✓</Text>
                    <Text className="text-keystone_slate font-inter text-xs flex-1">
                      {t.lastAction}
                    </Text>
                  </View>
                )}
              </Card>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PaymentZone;
