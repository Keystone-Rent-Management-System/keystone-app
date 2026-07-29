import React, {useState} from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {
  useTenantPayments,
  useTenantStatement,
} from '../../hooks/useTenantHome';
import {Card, Stat} from '../../components/premium';
import {
  HeroCard,
  ListRow,
  Screen,
  SectionLabel,
  SegmentedChoice,
  eventDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Activity — receipts ⇄ statement (design 5e). Routes `receipts` and
// `statements` merge into one screen with a segmented control; each
// payment row opens the 5b receipt. Statement mode keeps the
// balance/charges/payments ledger but drops the bar-chart icon on
// charge rows (brief P2-7) — charges use the ledger glyph, payments
// the card glyph. Rows follow D3: period in the title, verb-dated
// transaction in the meta, receipt code always visible.

const Activity = ({initialMode}) => {
  const nav = useNavigation();
  const route = useRoute();
  const [mode, setMode] = useState(
    initialMode ?? route.params?.mode ?? 'receipts',
  );

  const {payments, isPending: paymentsPending, isRefetching, refetch} =
    useTenantPayments();
  const {statement, isPending: stmtPending} = useTenantStatement();

  const total = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const entries = statement?.entries ?? [];
  const balance = statement?.closingBalance ?? 0;

  const openReceipt = p =>
    nav.navigate('rent_receipt', {
      amount: p.amount,
      method: p.method,
      date: p.date,
      code: p.code,
      period: p.period,
    });

  return (
    <Screen
      title="Activity"
      back="Pay"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <SegmentedChoice
        options={[
          {value: 'receipts', label: 'Receipts'},
          {value: 'statement', label: 'Statement'},
        ]}
        value={mode}
        onChange={setMode}
        style={{marginBottom: 16}}
      />

      {mode === 'receipts' ? (
        <>
          <HeroCard
            label="Paid through Keystone"
            badge={{text: `${payments.length} payments`}}
            amount={usd(total)}
            amountSize={34}
            sub="Every payment · on time · reported to the bureaus"
          />

          <View className="mt-5">
            <SectionLabel>All payments</SectionLabel>
            {paymentsPending ? (
              <Text className="text-text_muted font-inter text-sm ml-1">
                Loading…
              </Text>
            ) : payments.length === 0 ? (
              <Card>
                <Text className="text-text_muted font-inter text-sm">
                  No payments yet — every payment you make lands here,
                  instantly and permanently.
                </Text>
              </Card>
            ) : (
              <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
                {payments.map((p, i) => (
                  <ListRow
                    key={p.id}
                    icon="card"
                    iconColor={COLORS.c_success}
                    title={`Rent · ${p.period}`}
                    sub={`${eventDate('Paid', p.date)} · ${p.method} · ${p.code}`}
                    right={
                      <View className="items-end">
                        <Text
                          className="text-keystone_navy font-inter-bold text-sm"
                          style={{fontVariant: ['tabular-nums']}}>
                          {usd(p.amount)}
                        </Text>
                        <Text className="text-c_success font-inter-medium text-2xs mt-0.5 uppercase tracking-wider">
                          Paid
                        </Text>
                      </View>
                    }
                    last={i === payments.length - 1}
                    onPress={() => openReceipt(p)}
                  />
                ))}
              </Card>
            )}
          </View>
        </>
      ) : (
        <>
          <HeroCard
            label="Current balance"
            amount={usd(balance)}
            amountSize={34}
            sub={
              balance > 0
                ? 'This is your current rent due.'
                : 'You’re all settled — nothing owed.'
            }
          />

          <View className="mt-4">
            <Card>
              <View className="flex-row">
                <Stat label="Charges" value={usd(statement?.totalCharges)} />
                <View className="w-px bg-keystone_hairline" />
                <Stat
                  label="Payments"
                  value={usd(statement?.totalCredits)}
                  valueColor={COLORS.c_success}
                  align="right"
                />
              </View>
            </Card>
          </View>

          <View className="mt-5">
            <SectionLabel>Ledger</SectionLabel>
            {stmtPending ? (
              <Text className="text-text_muted font-inter text-sm ml-1">
                Loading…
              </Text>
            ) : (
              <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
                {entries.map((e, i) => {
                  const isCredit = (e.credit ?? 0) > 0;
                  return (
                    <ListRow
                      key={e.id}
                      // P2-7: ledger glyph for charges, card for payments
                      icon={isCredit ? 'card' : 'lease'}
                      iconColor={isCredit ? COLORS.c_success : COLORS.keystone_gold}
                      title={e.description}
                      sub={eventDate(isCredit ? 'Paid' : 'Charged', e.entryDate)}
                      right={
                        <Text
                          className="font-inter-bold text-sm"
                          style={{
                            color: isCredit ? COLORS.c_success : COLORS.keystone_navy,
                            fontVariant: ['tabular-nums'],
                          }}>
                          {isCredit ? '−' : '+'}
                          {usd(isCredit ? e.credit : e.charge)}
                        </Text>
                      }
                      last={i === entries.length - 1}
                    />
                  );
                })}
              </Card>
            )}
          </View>
        </>
      )}
    </Screen>
  );
};

const Receipts = () => <Activity initialMode="receipts" />;

export {Activity};
export default Receipts;
