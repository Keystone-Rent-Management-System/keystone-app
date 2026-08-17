import React from 'react';
import {StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Divider, Row, Icon, IconChip} from '../../components/premium';
import {
  HeroCard,
  Screen,
  SectionLabel,
  eventDate,
  periodLabel,
  shortDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Rent details (was: checkout, design 5a).
//
// This is a READ-ONLY screen until settlement exists. It is not a checkout
// with a disabled button — that is a different and still-dishonest thing.
//
// What was removed and why:
//   · The Pay CTA and its `Date.now()` receipt. There was never a
//     settlement request; the screen minted a confirmation code and
//     navigated to `rent_receipt`, so a tenant saw "Rent paid" while no
//     money moved.
//   · "YOU'RE PAYING · <MONTH>" and "paying today". Nobody is paying
//     anything here.
//   · The ACH/NACHA authorization block. Presenting an authorization for
//     a debit that cannot be initiated asks the tenant to consent to
//     nothing, and would leave no record of what they agreed to.
//   · "Goes straight to your landlord — instantly" and the $0-fee
//     settlement promise. Both describe a mechanism that does not run.
//
// The screen still answers the honest question a tenant has — what is
// owed, for which period, when it is due, and which account is on file.
//
// Restoring it (BE §T2) means: idempotency key, button locked while
// unresolved, `idle → submitting → confirmed | failed | unknown`, receipt
// built ONLY from the server response, reconciliation by transaction id on
// next launch, and the authorization re-introduced alongside a debit that
// can actually be initiated.

const PayRent = () => {
  const nav = useNavigation();
  const {home} = useTenantHome();

  const rent = home?.rent ?? {};
  const method = home?.paymentMethod ?? {};
  const lease = home?.lease ?? {};
  // NO TENANCY IS NOT A ZERO OBLIGATION.
  //
  // `rent.amount ?? 0` plus `periodLabel(rent.dueDate ?? new Date())`
  // turned an account with no lease into a current-month "$0 rent due",
  // and then told the person to "keep paying your landlord". Both facts
  // were invented from absent data. Fixing the date formatting removed
  // the visible "undefined NaN" but left the fabricated obligation.
  const hasTenancy = rent.amount != null && rent.dueDate != null;
  const amount = rent.amount ?? 0;
  // Server-supplied period is authoritative; the derived label is only a
  // fallback for fixtures that predate the field. The same value is used
  // on the Pay hub so the two can never name different months (P0-04).
  const period = rent.periodLabel ?? periodLabel(rent.dueDate);

  if (!hasTenancy) {
    return (
      <Screen title="Rent details" back="Pay">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <HeroCard
          label="Your rent"
          amount="No active tenancy"
          amountSize={22}
          sub="You don’t have a lease on this account yet."
        />
        <Card style={{marginTop: 20}}>
          <Text className="text-keystone_slate font-inter text-[13px] leading-5">
            When your landlord sets up your lease, your rent, due date and
            payment history will appear here.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Rent details" back="Pay">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label={`RENT DUE · ${period.toUpperCase()}`}
        amount={usd(amount)}
        sub={eventDate('Due', rent.dueDate)}
      />

      <Card style={{marginTop: 20}}>
        <Text className="text-keystone_navy font-inter-semibold text-[15px]">
          Paying rent in the app isn’t available yet
        </Text>
        <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
          Keep paying {lease.landlord ?? 'your landlord'} the way you do today.
          We’ll let you know the moment you can pay here.
        </Text>
      </Card>

      <View className="mt-5">
        <SectionLabel>Account on file</SectionLabel>
        <Card>
          <View className="flex-row items-center">
            <IconChip>
              <Icon name="bank" size={20} color={COLORS.keystone_gold} />
            </IconChip>
            <View className="flex-1 ml-3" style={{minWidth: 0}}>
              <Text
                numberOfLines={1}
                className="text-keystone_navy font-inter-semibold text-base">
                {method.name ?? 'No account added'}
                {method.last4 ? ` ••${method.last4}` : ''}
              </Text>
              <Text className="text-text_muted font-inter text-xs mt-0.5">
                {method.name ? 'Bank account' : 'Nothing to pay from yet'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => nav.navigate('payment_methods')}>
              <Text className="text-keystone_gold font-inter-semibold text-sm">
                Manage
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      <View className="mt-5">
        <SectionLabel>This period</SectionLabel>
        <Card>
          <Row label="Rent" value={usd(amount)} />
          <Divider />
          <Row label="Period" value={period} />
          <Divider />
          <Row label="Due" value={shortDate(rent.dueDate)} />
        </Card>
      </View>
    </Screen>
  );
};

export default PayRent;
