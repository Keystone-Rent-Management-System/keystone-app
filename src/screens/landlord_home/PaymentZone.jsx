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
import {PAYMENT_ZONES, usePaymentZones, useZoneTenants} from '../../hooks';
import {pct} from '../../utils/money';
import {Card, Avatar, Divider} from '../../components/premium';
import {
  HeroCard,
  Screen,
  SectionLabel,
  StatusChip,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Landlord PaymentZone (design 5f). The Google-palette donut is
// retired: a navy hero with a stacked distribution bar, and "180
// paid" as the headline number — not "200 tenants". Status rows keep
// the tappable-bucket pattern (do-not-lose) with brand hues: on-time
// is slate, not blue; semantic color appears as dots (C2 logic on
// light). Header owns the status zone (S1).

// Brand hues for the buckets (replaces the zones' raw chart colors).
const ZONE_HUES = {
  early: COLORS.c_success,
  onTime: COLORS.keystone_slate,
  late: COLORS.c_pending,
  notPaid: COLORS.c_danger,
};

const PaymentZone = () => {
  const {summary, total, isPending, refetch} = usePaymentZones();
  const [drilldown, setDrilldown] = useState(null);

  const zoneCount = key => summary.find(z => z.key === key)?.count ?? 0;
  const paid = zoneCount('early') + zoneCount('onTime');
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;
  const monthLabel = new Date()
    .toLocaleDateString('en-US', {month: 'long'})
    .toUpperCase();

  const distribution = summary
    .map(z => `${z.count} ${z.label.toLowerCase()}`)
    .join(' · ');

  return (
    <Screen
      variant="hub"
      refreshControl={
        <RefreshControl
          refreshing={isPending}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }
      contentStyle={{paddingTop: 16}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text className="text-keystone_navy font-inter-bold text-3xl">
        Payments
      </Text>
      <Text className="text-keystone_slate font-inter text-base mt-1 mb-5">
        {total} tenant{total === 1 ? '' : 's'} tracked · tap a status to see who.
      </Text>

      {/* Hero — headline is who's PAID, with a stacked distribution bar */}
      <HeroCard
        label={`${monthLabel} · ${total} TENANTS`}
        badge={{text: `${paidPct}% in`, dot: 'success'}}
        amount={`${paid} paid`}
        footnote={distribution}>
        {/* Stacked distribution bar — sits between the headline and the
            breakdown line (5f) */}
        {total > 0 && (
          <View
            style={{
              flexDirection: 'row',
              height: 8,
              borderRadius: 999,
              overflow: 'hidden',
              marginTop: 12,
              backgroundColor: 'rgba(231,229,218,0.14)',
            }}>
            {summary.map(z => (
              <View
                key={z.key}
                style={{
                  flex: Math.max(z.count, 0.001),
                  backgroundColor: ZONE_HUES[z.key] ?? z.color,
                }}
              />
            ))}
          </View>
        )}
      </HeroCard>

      {/* Bucket table */}
      <View className="mt-5">
        <SectionLabel>By status</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {summary.map((zone, idx) => (
            <TouchableOpacity
              key={zone.key}
              onPress={() => setDrilldown(zone.key)}
              activeOpacity={0.6}
              className="flex-row items-center py-3.5"
              style={
                idx < summary.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.keystone_hairline,
                }
              }>
              <View
                style={{backgroundColor: ZONE_HUES[zone.key] ?? zone.color}}
                className="w-2 h-2 rounded-full mr-3"
              />
              <View className="flex-1" style={{minWidth: 0}}>
                <Text
                  numberOfLines={1}
                  className="text-keystone_navy font-inter-semibold text-base">
                  {zone.label}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-text_muted font-inter text-xs">
                  {zone.description}
                </Text>
              </View>
              {/* count · share · chevron, all on one line (5f) */}
              <View className="flex-row items-center" style={{flexShrink: 0}}>
                <Text
                  className="font-inter-bold text-base"
                  style={{
                    fontVariant: ['tabular-nums'],
                    color: zone.key === 'notPaid' ? '#B32020' : COLORS.keystone_navy,
                  }}>
                  {zone.count}
                </Text>
                <Text className="text-keystone_slate font-inter text-sm ml-1.5">
                  · {total > 0 ? pct((zone.count / total) * 100) : '0%'}
                </Text>
                <Text className="text-keystone_slate font-inter-semibold ml-2">
                  ›
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <TenantDrilldown bucketKey={drilldown} onClose={() => setDrilldown(null)} />
    </Screen>
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
              <View
                style={{backgroundColor: ZONE_HUES[bucketKey] ?? zone?.color}}
                className="w-3 h-3 rounded-full"
              />
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
                  <View className="flex-1" style={{minWidth: 0}}>
                    <Text
                      numberOfLines={1}
                      className="text-keystone_navy font-inter-semibold text-base">
                      {t.name}
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      {t.unitName}
                    </Text>
                  </View>
                  {bucketKey === 'notPaid' && t.daysOverdue > 0 && (
                    <StatusChip tone="danger" label={`${t.daysOverdue}d overdue`} />
                  )}
                  {bucketKey === 'late' && t.daysOverdue > 0 && (
                    <StatusChip tone="pending" label={`${t.daysOverdue}d late`} />
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
