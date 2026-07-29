import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {
  Card,
  Avatar,
  Divider,
  Icon,
  IconChip,
  BrandLockup,
  KSTile,
  ProgressBar,
} from '../../components/premium';
import {
  HeroCard,
  ListRow,
  Screen,
  SectionLabel,
  dueLine,
  eventDate,
  periodLabel,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Tenant Home — rent center hub (design 2c). Home keeps only what
// needs action: rent hero on top (1b contract, D1/D2 labels), white
// setup checklist (navy is reserved for money), NEEDS YOU list, and
// the credit K1 row. Lease/property card lives in My Home; payment
// history lives in Pay → Activity.

const TenantHome = () => {
  const {home, isPending, isRefetching, refetch} = useTenantHome();
  const nav = useNavigation();

  const tenant = home?.tenant ?? {};
  const rent = home?.rent ?? {};
  const lease = home?.lease ?? {};
  const credit = home?.credit ?? {};
  const checklist = home?.checklist ?? {};
  const openRepairs = home?.openRepairs ?? 0;

  const firstName = tenant.firstName ?? '';
  const initials = `${(tenant.firstName ?? 'T')[0] ?? ''}${
    (tenant.lastName ?? '')[0] ?? ''
  }`.toUpperCase();

  const now = new Date();
  const hours = now.getHours();
  const greeting =
    hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const isPaid = rent.status === 'PAID';
  const isOverdue = rent.status === 'OVERDUE';
  const isPendingLease = lease.agreementStatus === 'PENDING';
  const renewalSoon = (lease.daysToEnd ?? 999) <= 60;

  const needs = [
    isPendingLease && {
      icon: 'lease',
      tone: 'pending',
      text: 'Review & accept your lease',
      hint: 'Activate your tenancy',
      onPress: () => nav.navigate('lease'),
    },
    checklist.status === 'IN_PROGRESS' && {
      icon: 'reports',
      tone: 'pending',
      text: 'Finish your move-in checklist',
      hint: `${checklist.completed}/${checklist.total} rooms · protects your deposit`,
      onPress: () => nav.navigate('my_home_stack', {screen: 'checklist'}),
    },
    openRepairs > 0 && {
      icon: 'wrench',
      tone: 'danger',
      text: `${openRepairs} repair ${openRepairs === 1 ? 'is' : 'are'} in progress`,
      hint: 'Track the status',
      onPress: () => nav.navigate('my_home_stack', {screen: 'repairs'}),
    },
    renewalSoon && {
      icon: 'scale',
      tone: 'pending',
      // D2: verb-first absolute date; D4: relative restates it.
      text: `Your lease ${eventDate('ends', lease.endDate)}`,
      hint: `Renew or give notice · in ${lease.daysToEnd} days`,
      onPress: () => nav.navigate('my_home_stack', {screen: 'move_out'}),
    },
  ].filter(Boolean);

  const onboarding = home?.onboarding ?? {};
  const setupSteps = onboarding.steps ?? [];
  const setupDone = setupSteps.filter(s => s.done).length;
  const showSetup =
    !onboarding.complete && setupSteps.length > 0 && setupDone < setupSteps.length;
  const goStep = step =>
    step.tab ? nav.navigate(step.tab, {screen: step.screen}) : nav.navigate(step.screen);

  const feel = isPaid
    ? "You're all caught up — nothing to do but live here."
    : isOverdue
      ? 'Your rent is past due. A quick tap clears it.'
      : rent.daysUntilDue <= 3
        ? 'Rent is due soon — two taps and it’s handled.'
        : 'Everything looks good. Rent’s the only thing on your plate.';

  const goPay = () => nav.navigate('pay_rent');

  if (isPending && !home) {
    return (
      <View className="flex-1 bg-keystone_canvas items-center justify-center">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <BrandLockup size={26} />
        <ActivityIndicator color={COLORS.keystone_gold} style={{marginTop: 18}} />
      </View>
    );
  }

  return (
    <Screen
      variant="hub"
      logoRow={
        <View className="flex-row items-center justify-between">
          <KSTile />
          <Avatar initials={initials} size={40} />
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }
      contentStyle={{paddingTop: 12}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {/* Greeting */}
      <Text className="text-keystone_slate font-inter text-[13px]">{dateLabel}</Text>
      <Text
        className="text-keystone_navy font-inter-bold mt-1"
        style={{fontSize: 34, lineHeight: 40, letterSpacing: -0.3}}>
        {greeting}
        {firstName ? `, ${firstName}` : ''}.
      </Text>
      <Text className="text-keystone_slate font-inter text-base mt-2 mb-5 leading-5">
        {feel}
      </Text>

      {/* RENT HERO — top slot (2c), 1b contract, D1/D2 labels */}
      <HeroCard
        label={
          isPaid
            ? `${periodLabel(rent.dueDate ?? now)} · PAID`
            : periodLabel(rent.dueDate ?? now)
        }
        badge={{text: 'Instant · Direct', dot: 'success'}}
        amount={usd(rent.amount)}
        sub={
          isPaid
            ? 'Your last payment went straight to your landlord’s bank — instantly.'
            : dueLine(rent.dueDate)
        }
        cta={
          !isPaid
            ? {label: `Pay rent — ${usd(rent.amount)}`, onPress: goPay}
            : undefined
        }
        footnote={
          !isPaid
            ? 'Paid the moment you tap — straight to your landlord’s bank.'
            : undefined
        }
      />

      {/* FINISH SETTING UP — white card, gold progress (2c: navy is
          reserved for money) */}
      {showSetup && (
        <View className="mt-4">
          <SectionLabel>
            Finish setting up · {setupSteps.length - setupDone} of{' '}
            {setupSteps.length} left
          </SectionLabel>
          <Card>
            <View className="mb-2">
              <ProgressBar percent={(setupDone / setupSteps.length) * 100} />
            </View>
            {setupSteps.map(step => (
              <TouchableOpacity
                key={step.key}
                activeOpacity={step.done ? 1 : 0.7}
                disabled={step.done}
                onPress={() => goStep(step)}
                className="flex-row items-center"
                style={{paddingVertical: 6}}>
                <View
                  className="items-center justify-center mr-2.5"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: step.done
                      ? 'rgba(5,166,96,0.12)'
                      : 'transparent',
                    borderWidth: step.done ? 0 : 2,
                    borderColor: 'rgba(21,37,53,0.2)',
                  }}>
                  {step.done && (
                    <Text style={{fontSize: 12, color: '#037147'}}>✓</Text>
                  )}
                </View>
                <Text
                  className={`flex-1 ${
                    step.done
                      ? 'font-inter line-through'
                      : 'text-keystone_navy font-inter-semibold'
                  }`}
                  style={[
                    {fontSize: 15},
                    step.done && {color: 'rgba(21,37,53,0.45)'},
                  ]}>
                  {step.label}
                </Text>
                {!step.done && (
                  <Text className="text-keystone_slate font-inter-semibold">
                    ›
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      {/* NEEDS YOU */}
      {needs.length > 0 && (
        <View className="mt-4">
          <SectionLabel>Needs you · {needs.length}</SectionLabel>
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            {needs.map((n, i) => (
              <NeedRow key={n.text} item={n} last={i === needs.length - 1} />
            ))}
          </Card>
        </View>
      )}

      {/* CREDIT — K1 row with score + delta in the right slot */}
      {credit.score ? (
        <View className="mt-4">
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            <ListRow
              icon="trending"
              title="Your rent is building credit"
              sub={`${credit.streakMonths} months on time · reported to the bureaus`}
              last
              onPress={() => nav.navigate('credit')}
              right={
                <View className="items-end">
                  <Text
                    className="text-keystone_navy font-inter-bold text-lg"
                    style={{fontVariant: ['tabular-nums']}}>
                    {credit.score}
                  </Text>
                  <Text className="text-c_success font-inter-semibold text-2xs">
                    ▲ {credit.delta} pts
                  </Text>
                </View>
              }
            />
          </Card>
        </View>
      ) : null}
    </Screen>
  );
};

const NeedRow = ({item, last}) => {
  const accent = item.tone === 'danger' ? COLORS.c_danger : COLORS.c_pending;
  const bg = item.tone === 'danger' ? 'rgba(229,53,53,0.10)' : 'rgba(205,160,0,0.12)';
  return (
    <TouchableOpacity
      onPress={item.onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-3.5"
      style={
        !last && {
          borderBottomWidth: 0.5,
          borderBottomColor: COLORS.keystone_hairline,
        }
      }>
      <View
        style={{backgroundColor: bg}}
        className="w-10 h-10 rounded-xl items-center justify-center mr-3">
        <Icon name={item.icon} size={18} color={accent} />
      </View>
      <View className="flex-1" style={{minWidth: 0}}>
        <Text
          numberOfLines={1}
          className="text-keystone_navy font-inter-semibold text-sm">
          {item.text}
        </Text>
        <Text numberOfLines={1} className="text-text_muted font-inter text-xs mt-0.5">
          {item.hint}
        </Text>
      </View>
      <Text className="text-text_muted font-inter-semibold text-base">›</Text>
    </TouchableOpacity>
  );
};

export default TenantHome;
