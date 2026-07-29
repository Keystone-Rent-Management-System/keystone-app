import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card} from '../../components/premium';
import {
  HeroCard,
  ListRow,
  Screen,
  SectionLabel,
  StatusChip,
  eventDate,
  periodLabel,
  periodTitle,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Pay hub (design 2d): hero CTA inside padding (H1/H2), chip carries
// the due date (D1/D2). Payment history + receipts + statement merge
// into one Activity row; autopay state is a chip, default method
// surfaces inline; the last receipt stays pinned one tap from the hub.

const PayHub = () => {
  const nav = useNavigation();
  const {home, isRefetching, refetch} = useTenantHome();
  const rent = home?.rent ?? {};
  const autopay = home?.autopay ?? {};
  const method = home?.paymentMethod ?? {};
  const lastPayment = (home?.recentPayments ?? [])[0];
  const isPaid = rent.status === 'PAID';
  const isOverdue = rent.status === 'OVERDUE';

  return (
    <Screen
      variant="hub"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }
      contentStyle={{paddingTop: 16}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text
        className="text-keystone_navy font-inter-bold"
        style={{fontSize: 34, lineHeight: 40, letterSpacing: -0.3}}>
        Pay
      </Text>
      <Text className="text-keystone_slate font-inter text-base mt-1 mb-5">
        Instant, free, straight to your landlord's bank.
      </Text>

      <HeroCard
        label={isPaid ? `${periodLabel(rent.dueDate)} · PAID` : periodLabel(rent.dueDate)}
        badge={{
          text: isPaid ? 'Paid' : eventDate('Due', rent.dueDate).toUpperCase(),
          dot: isPaid ? 'success' : isOverdue ? 'danger' : 'pending',
        }}
        amount={usd(rent.amount)}
        cta={
          !isPaid
            ? {
                label: `Pay rent — ${usd(rent.amount)}`,
                onPress: () => nav.navigate('pay_rent'),
              }
            : undefined
        }
      />

      <View className="mt-5">
        <SectionLabel>Manage</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          <ListRow
            icon="shield"
            title="Autopay"
            sub={
              autopay.enabled
                ? `Pays on the ${ordinal(autopay.dayOfMonth)} · builds your streak`
                : 'Turn on to never miss rent'
            }
            chip={{
              label: autopay.enabled ? 'On' : 'Off',
              tone: autopay.enabled ? 'success' : 'neutral',
            }}
            onPress={() => nav.navigate('autopay')}
          />
          <ListRow
            icon="scale"
            title="Need more time?"
            sub="Split this month or pay part now"
            chevron
            onPress={() => nav.navigate('pay_rent', {flex: true})}
          />
          <ListRow
            icon="bank"
            title="Payment methods"
            sub={
              method.name
                ? `${method.name} ••${method.last4} default · instant`
                : 'Banks & cards'
            }
            chevron
            onPress={() => nav.navigate('payment_methods')}
          />
          <ListRow
            icon="collection"
            title="Activity"
            sub="Receipts, charges & credits — all in one place"
            chevron
            last
            onPress={() => nav.navigate('receipts')}
          />
        </Card>
      </View>

      {/* Last receipt pinned — proof of payment one tap from the hub */}
      {lastPayment ? (
        <View className="mt-4">
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            <ListRow
              icon="card"
              iconColor={COLORS.c_success}
              title={lastPayment.period ? `Rent · ${lastPayment.period}` : periodTitle(lastPayment.date)}
              sub={`${eventDate('Paid', lastPayment.date)} · ${lastPayment.method} · ${lastPayment.code}`}
              chip={{label: 'Paid', tone: 'success'}}
              last
              onPress={() =>
                nav.navigate('rent_receipt', {
                  amount: lastPayment.amount,
                  method: lastPayment.method,
                  date: lastPayment.date,
                  code: lastPayment.code,
                  period: lastPayment.period,
                })
              }
            />
          </Card>
        </View>
      ) : null}
    </Screen>
  );
};

const ordinal = n => {
  if (!n) return '1st';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default PayHub;
