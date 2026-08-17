import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Divider, Icon, IconChip} from '../../components/premium';
import {HeroCard, Screen, SectionLabel, usd} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {can} from '../../constants/capabilities';

// Autopay (design 2e) — explanatory, not configurable, until BE §T12.
//
// Everything that let a tenant *configure* autopay is gone, along with
// every promise about what it would do. Disabling the CTA alone was not
// enough: the screen still presented a day-of-month segment, a 1–28 day
// strip and a payment-method picker, all of which accepted taps and
// changed state that no server would ever hear about. A tenant could set
// "pay on the 3rd from my checking account", see it reflected on screen,
// and reasonably believe rent was scheduled.
//
// The outcome promises went with them, because none of them is backed by
// anything today:
//   · "We pay $1,800 on the 1st of each month — automatically."
//   · a what-happens-next timeline including "Same day — credit reported"
//   · "If a payment can't be made, we never retry silently — you get a
//     push, email, and 3 days to fix it before rent is late."
// That last one is a failure-handling guarantee for a system that does
// not run; it is the most damaging of the three.
//
// Restore with BE §T12 (GET/PATCH /tenants/autopay): a persisted mandate
// with effective date, a server-confirmed on/off state, real retry and
// notification behaviour, and the NACHA authorization reinstated next to
// a debit that can actually be initiated.

const Autopay = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const rent = home?.rent ?? {};
  const method = (home?.paymentMethods ?? [])[0];

  return (
    <Screen
      title="Autopay"
      back="Pay"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="Autopay"
        badge={{text: can('autopay') ? 'Off' : 'Not available yet'}}
        amount={can('autopay') ? 'Off' : 'Coming later'}
        amountSize={24}
        sub={
          can('autopay')
            ? 'Pay your rent automatically each month.'
            : 'Autopay needs in-app rent payments, which aren’t ready yet.'
        }
      />

      <Card style={{marginTop: 20}}>
        <Text className="text-keystone_navy font-inter-semibold text-[15px]">
          What autopay will do
        </Text>
        <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
          Pay {rent.amount ? usd(rent.amount) : 'your rent'} from an account you
          choose, on a day you choose, so you don’t have to remember. You’ll be
          able to turn it off at any time.
        </Text>
        <Divider style={{marginVertical: 12}} />
        <Text className="text-keystone_slate font-inter text-[13px] leading-5">
          Until then, keep paying your landlord the way you do today.
        </Text>
      </Card>

      {method ? (
        <View className="mt-5">
          <SectionLabel>Account on file</SectionLabel>
          <Card style={{paddingVertical: 6, paddingHorizontal: 16}}>
            <View className="flex-row items-center py-3.5">
              <IconChip size={38}>
                <Icon
                  name={method.type === 'bank' ? 'bank' : 'card'}
                  size={17}
                  color={COLORS.keystone_gold}
                />
              </IconChip>
              <View className="flex-1 ml-3" style={{minWidth: 0}}>
                <Text
                  numberOfLines={1}
                  className="text-keystone_navy font-inter-semibold text-sm">
                  {method.name} ••{method.last4}
                </Text>
                <Text className="text-text_muted font-inter text-xs mt-0.5">
                  {method.type === 'bank' ? 'Bank account' : 'Debit card'}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
};

export default Autopay;
