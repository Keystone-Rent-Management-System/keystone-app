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
  sumUsd,
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

  const {
    payments,
    isPending: paymentsPending,
    isRefetching,
    refetch,
    error: paymentsError,
  } = useTenantPayments();
  const {
    statement,
    isPending: stmtPending,
    error: stmtError,
  } = useTenantStatement();

  // Rounded per row, THEN summed — the same precision the rows are
  // rendered at. Summing raw floats and rounding once at the end let
  // three $100.40 rows sit under a $301 header.
  //
  // NO `?? 0` HERE. It was there, and it defeated the whole point: an
  // unknown row collapsed to zero before `sumUsd` could see it, so the
  // total rendered $2,050.50 over rows reading "$1,800 · — · $250.50".
  // The rows must add up to the total a reader can see, so if any amount
  // is unknown the total is unknown too.
  const total = sumUsd(payments.map(p => p.amount));
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
          {/* A failed payment-history request produced an empty array,
              which rendered as "0 payments · $0" — a factual claim about
              someone's money made from a network error. */}
          {paymentsError ? (
            <HeroCard
              label="Paid through Keystone"
              amount="Not available"
              amountSize={22}
              sub="We couldn’t load your payment history. This isn’t a record of what you’ve paid."
            />
          ) : (
            <HeroCard
              label="Paid through Keystone"
              badge={{text: `${payments.length} payments`}}
              amount={usd(total)}
              amountSize={34}
              sub={
                total === null
                  ? 'One or more amounts are missing, so we can’t total these yet.'
                  : 'Your payment history in one place'
              }
            />
          )}

          <View className="mt-5">
            <SectionLabel>All payments</SectionLabel>
            {paymentsPending ? (
              <Text className="text-text_muted font-inter text-sm ml-1">
                Loading…
              </Text>
            ) : paymentsError ? (
              /* Was "No payments yet" — an empty-list statement rendered
                 directly beneath a hero that had just said the history
                 could not be loaded. */
              <Card>
                <Text className="text-text_muted font-inter text-sm">
                  We couldn’t load your payments. This isn’t a record that
                  there are none.
                </Text>
              </Card>
            ) : payments.length === 0 ? (
              <Card>
                <Text className="text-text_muted font-inter text-sm">
                  No payments yet. Payments made through Keystone will appear
                  here.
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
          {/* Failed statement → balance 0 → "You're all settled —
              nothing owed." A tenant could stop paying on the strength of
              a request that never succeeded. */}
          {stmtError || !statement ? (
            <HeroCard
              label="Current balance"
              amount="Not available"
              amountSize={22}
              sub="We couldn’t load your statement. Don’t treat this as settled."
            />
          ) : (
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
          )}

          {/* `usd(undefined)` is "$0", so a failed statement rendered
              Charges $0 and Payments $0 — two financial facts invented
              from a missing response. */}
          <View className="mt-4">
            <Card>
              <View className="flex-row">
                <Stat
                  label="Charges"
                  value={
                    statement?.totalCharges != null
                      ? usd(statement.totalCharges)
                      : '—'
                  }
                />
                <View className="w-px bg-keystone_hairline" />
                <Stat
                  label="Payments"
                  value={
                    statement?.totalCredits != null
                      ? usd(statement.totalCredits)
                      : '—'
                  }
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
            ) : stmtError || !statement ? (
              /* An empty ledger is indistinguishable from a ledger we
                 could not fetch, and an empty ledger reads as "nothing
                 has happened on your account". */
              <Card>
                <Text className="text-text_muted font-inter text-sm">
                  We couldn’t load your ledger. This isn’t a record that
                  there are no charges or payments.
                </Text>
              </Card>
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
