import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Divider, Icon, IconChip, Avatar} from '../../components/premium';
import {
  HeroCard,
  Screen,
  SectionLabel,
  StatusChip,
  eventDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Roommates (design 6g; quality bar, light pass). Copy kept verbatim
// (do-not-lose: "Your lease is yours alone"). Fixes: hero adds
// "of $1,800 total · due Aug 1" context (D1/D2); household rows
// verb-date payments ("paid Jul 25"); the explainer keeps the
// gold-hairline emphasis card used for offers.

const initials = name =>
  (name || '')
    .split(' ')
    .slice(0, 2)
    .map(p => p?.[0] ?? '')
    .join('')
    .toUpperCase();

const Roommates = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const hh = home?.household ?? {};
  const rent = home?.rent ?? {};
  const members = hh.members ?? [];
  const monthLabel = new Date()
    .toLocaleDateString('en-US', {month: 'long'})
    .toUpperCase();

  return (
    <Screen
      title="Roommates"
      back="My Home"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="Your share of rent"
        amount={`${usd(hh.yourShare)}/mo`}
        amountSize={34}
        sub={`of ${usd(hh.totalRent)} total · ${
          rent.dueDate ? eventDate('due', rent.dueDate) : hh.splitLabel ?? ''
        }`}
      />

      {/* The differentiator — gold-hairline emphasis card */}
      <View className="mt-4">
        <Card style={{borderColor: COLORS.keystone_gold, borderWidth: 1}}>
          <View className="flex-row items-center gap-3">
            <IconChip>
              <Icon name="shield" size={19} color={COLORS.keystone_gold} />
            </IconChip>
            <Text className="text-keystone_navy font-inter-semibold text-sm flex-1">
              Your lease is yours alone
            </Text>
          </View>
          <Divider style={{marginVertical: 12}} />
          <Text className="text-text_muted font-inter text-xs leading-5">
            You only owe your share. If a roommate pays late or moves out, it's
            never on you — and your credit reflects only the payments you make.
            Each roommate has their own agreement.
          </Text>
        </Card>
      </View>

      {/* Household */}
      <View className="mt-5">
        <SectionLabel>Your household · {monthLabel}</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {members.map((m, i) => (
            <View
              key={m.id}
              className="flex-row items-center py-3.5"
              style={
                i < members.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.keystone_hairline,
                }
              }>
              <Avatar initials={initials(m.name)} size={40} />
              <View className="flex-1 ml-3" style={{minWidth: 0}}>
                <Text
                  numberOfLines={1}
                  className="text-keystone_navy font-inter-semibold text-sm">
                  {m.name}
                  {m.you ? ' (you)' : ''}
                </Text>
                {/* D2: verb-dated payment state */}
                <Text
                  numberOfLines={1}
                  className="text-text_muted font-inter text-xs mt-0.5">
                  {usd(m.share)}/mo share ·{' '}
                  {m.status === 'PAID'
                    ? m.paidOn
                      ? eventDate('paid', m.paidOn)
                      : 'paid'
                    : rent.dueDate
                      ? eventDate('due', rent.dueDate)
                      : 'due'}
                </Text>
              </View>
              <StatusChip
                label={m.status === 'PAID' ? 'Paid' : 'Due'}
                tone={m.status === 'PAID' ? 'success' : 'pending'}
              />
            </View>
          ))}
        </Card>
        <Text className="text-text_muted font-inter text-xs mt-3 ml-1 leading-5">
          Everyone pays their own share through Keystone and builds their own
          credit. You only ever see and owe yours.
        </Text>
      </View>
    </Screen>
  );
};

export default Roommates;
