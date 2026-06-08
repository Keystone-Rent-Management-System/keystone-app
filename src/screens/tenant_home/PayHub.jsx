import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, IconChip, Label, AnimatedAmount, Icon} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Pay — the money hub. Rent at the top, then everything money: autopay,
// methods, flexibility, history. Mirrors the landlord Payments tab.

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
};

const PayHub = () => {
  const nav = useNavigation();
  const {home, isRefetching, refetch} = useTenantHome();
  const rent = home?.rent ?? {};
  const autopay = home?.autopay ?? {};
  const isPaid = rent.status === 'PAID';

  const ROWS = [
    {
      key: 'autopay',
      icon: 'shield',
      title: 'Autopay',
      sub: autopay.enabled ? `On · pays on the ${ordinal(autopay.dayOfMonth)}` : 'Off · turn on to never miss rent',
      onPress: () => nav.navigate('autopay'),
    },
    {
      key: 'flex',
      icon: 'scale',
      title: 'Need more time?',
      sub: 'Split this month or pay part now',
      onPress: () => nav.navigate('pay_rent', {flex: true}),
    },
    {
      key: 'methods',
      icon: 'bank',
      title: 'Payment methods',
      sub: 'Banks & cards',
      onPress: () => nav.navigate('payment_methods'),
    },
    {
      key: 'receipts',
      icon: 'reports',
      title: 'Payment history',
      sub: 'Every receipt',
      onPress: () => nav.navigate('receipts'),
    },
    {
      key: 'statements',
      icon: 'collection',
      title: 'Statement',
      sub: 'Charges & credits',
      onPress: () => nav.navigate('statements'),
    },
  ];

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Rent hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>
              {isPaid ? 'Rent · paid' : `Rent ${rent.status === 'OVERDUE' ? 'overdue' : 'due'} · ${rent.periodLabel ?? ''}`}
            </Label>
            <AnimatedAmount value={rent.amount} format={usd} size="xl" onDark style={{marginTop: 10}} />
            <Text className="text-white/60 font-inter text-xs mt-1">
              {isPaid ? `Next rent ${fmtDate(rent.dueDate)}` : `Due ${fmtDate(rent.dueDate)} · in ${rent.daysUntilDue} days`}
            </Text>
            {!isPaid && (
              <TouchableOpacity
                onPress={() => nav.navigate('pay_rent')}
                activeOpacity={0.9}
                className="bg-keystone_cream rounded-2xl py-3.5 items-center mt-4">
                <Text className="text-keystone_navy font-inter-bold text-base">
                  Pay rent — {usd(rent.amount)}
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        </View>

        {/* Money rows */}
        <View className="px-4 mt-5">
          <Card style={{paddingVertical: 6}}>
            {ROWS.map((r, i) => (
              <View key={r.key}>
                {i > 0 && <View className="h-px bg-keystone_hairline mx-3" />}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={r.onPress}
                  className="flex-row items-center px-3 py-3.5">
                  <IconChip size={40}>
                    <Icon name={r.icon} size={18} />
                  </IconChip>
                  <View className="flex-1 ml-3">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">
                      {r.title}
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      {r.sub}
                    </Text>
                  </View>
                  <Text className="text-text_muted font-inter-semibold text-base">›</Text>
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const ordinal = n => {
  if (!n) return '1st';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default PayHub;
