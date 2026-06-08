import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {
  Card,
  IconChip,
  Avatar,
  Label,
  AnimatedAmount,
  Divider,
  Stat,
  Icon,
  ProgressBar,
  KeystoneLogo,
} from '../../components/premium';
import COLORS from '../../constants/Theme';

// The tenant's command center — same Keystone language as the landlord
// side. A renter opens this and in one glance knows: is my rent paid,
// when's it due, and can I pay it in two taps. Rent is paid instantly +
// directly to the landlord's bank, so the story is "tap, done" — no
// paybills, no fees to the tenant.

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
};

const TenantHome = () => {
  const {home, isPending, isRefetching, refetch} = useTenantHome();
  const nav = useNavigation();

  const tenant = home?.tenant ?? {};
  const rent = home?.rent ?? {};
  const lease = home?.lease ?? {};
  const autopay = home?.autopay ?? {};
  const payments = home?.recentPayments ?? [];

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

  const credit = home?.credit ?? {};
  const checklist = home?.checklist ?? {};
  const openRepairs = home?.openRepairs ?? 0;
  const renewalSoon = (lease.daysToEnd ?? 999) <= 60;

  // The few things that need the tenant — across the whole tenancy, in
  // plain language (mirrors the landlord "A few things need you"). Rent
  // lives in its own hero below, so it's not duplicated here.
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
      text: 'Your lease ends soon',
      hint: 'Renew or give notice',
      onPress: () => nav.navigate('my_home_stack', {screen: 'move_out'}),
    },
  ].filter(Boolean);

  // Guided first-run — the optional setup steps a new tenant still has open.
  const onboarding = home?.onboarding ?? {};
  const setupSteps = onboarding.steps ?? [];
  const setupDone = setupSteps.filter(s => s.done).length;
  const showSetup =
    !onboarding.complete && setupSteps.length > 0 && setupDone < setupSteps.length;
  const goStep = step =>
    step.tab ? nav.navigate(step.tab, {screen: step.screen}) : nav.navigate(step.screen);

  // A warm, human read of where they stand.
  const feel = isPaid
    ? "You're all caught up — nothing to do but live here."
    : isOverdue
      ? 'Your rent is past due. A quick tap clears it.'
      : rent.daysUntilDue <= 3
        ? 'Rent is due soon — two taps and it’s handled.'
        : 'Everything looks good. Rent’s the only thing on your plate.';

  const goPay = () => nav.navigate('pay_rent');

  // First load with no cached data — show a clean branded splash rather
  // than empty $0 scaffolding with a "Loading…" overlaid on top.
  if (isPending && !home) {
    return (
      <View className="flex-1 bg-keystone_canvas items-center justify-center">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <KeystoneLogo height={40} />
        <ActivityIndicator color={COLORS.keystone_gold} style={{marginTop: 18}} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 32}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.keystone_gold}
          />
        }>
        {/* Brand + profile */}
        <View className="px-5 pt-12 flex-row items-center justify-between">
          <KeystoneLogo height={38} />
          <Avatar initials={initials} size={44} />
        </View>

        {/* Warm greeting */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-text_muted font-inter text-xs">{dateLabel}</Text>
          <Text className="text-keystone_navy font-inter-bold text-3xl mt-1">
            {greeting}
            {firstName ? `, ${firstName}` : ''}.
          </Text>
          <Text className="text-keystone_slate font-inter text-base mt-2 leading-5">
            {feel}
          </Text>
        </View>

        {/* Finish setting up — guided first-run, hides once complete */}
        {showSetup && (
          <View className="px-4 mb-3">
            <Card feature>
              <View className="flex-row items-center justify-between">
                <Label onDark>Finish setting up</Label>
                <Text className="text-white/60 font-inter-semibold text-xs">
                  {setupDone} of {setupSteps.length}
                </Text>
              </View>
              <View className="mt-3 mb-1">
                <ProgressBar
                  percent={(setupDone / setupSteps.length) * 100}
                  onDark
                />
              </View>
              <View className="mt-2">
                {setupSteps.map((step, i) => (
                  <TouchableOpacity
                    key={step.key}
                    activeOpacity={step.done ? 1 : 0.7}
                    disabled={step.done}
                    onPress={() => goStep(step)}
                    className="flex-row items-center py-2.5">
                    <View
                      className="w-5 h-5 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: step.done ? COLORS.keystone_gold : 'transparent',
                        borderWidth: step.done ? 0 : 1.5,
                        borderColor: 'rgba(255,255,255,0.4)',
                      }}>
                      {step.done && (
                        <Text className="text-keystone_navy" style={{fontSize: 11}}>
                          ✓
                        </Text>
                      )}
                    </View>
                    <Text
                      className={`flex-1 font-inter ${step.done ? 'text-white/45 line-through' : 'text-white font-inter-medium'}`}
                      style={{fontSize: 14}}>
                      {step.label}
                    </Text>
                    {!step.done && (
                      <Text className="text-white/50 font-inter-semibold">›</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* A few things need you — one place to see what's on your plate */}
        {needs.length > 0 && (
          <View className="px-4 mb-1">
            <Card style={{padding: 6}}>
              <View className="px-3 pt-3 pb-1 flex-row items-center justify-between">
                <Text className="text-keystone_navy font-inter-semibold text-base">
                  A few things need you
                </Text>
                <View className="bg-keystone_chip rounded-full w-6 h-6 items-center justify-center">
                  <Text className="text-keystone_navy font-inter-bold text-xs">
                    {needs.length}
                  </Text>
                </View>
              </View>
              {needs.map((n, i) => (
                <View key={i}>
                  {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                  <NeedRow item={n} />
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* RENT HERO — the whole point of the screen */}
        <View className="px-4 mt-1">
          <Card feature>
            <View className="flex-row items-center justify-between">
              <Label onDark>
                {isPaid
                  ? 'Rent · paid'
                  : `Rent ${isOverdue ? 'overdue' : 'due'} · ${rent.periodLabel ?? ''}`}
              </Label>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: isPaid
                      ? COLORS.c_success
                      : isOverdue
                        ? COLORS.c_danger
                        : COLORS.keystone_gold,
                  }}
                />
                <Text className="text-white/70 font-inter-medium text-2xs uppercase tracking-wider">
                  Instant · Direct
                </Text>
              </View>
            </View>

            <AnimatedAmount
              value={rent.amount}
              format={usd}
              size="xl"
              onDark
              style={{marginTop: 12}}
            />

            {isPaid ? (
              <View className="flex-row items-center mt-2">
                <Text className="text-c_success font-inter-semibold text-sm">
                  ✓ Paid in full
                </Text>
                <Text className="text-white/55 font-inter text-sm">
                  {'  ·  '}Next rent {fmtDate(rent.dueDate)}
                </Text>
              </View>
            ) : (
              <Text
                className="font-inter text-sm mt-2"
                style={{color: isOverdue ? '#FF9B9B' : 'rgba(255,255,255,0.75)'}}>
                Due {fmtDate(rent.dueDate)}
                {isOverdue ? ' · past due' : ` · in ${rent.daysUntilDue} days`}
              </Text>
            )}

            {!isPaid && (
              <TouchableOpacity
                onPress={goPay}
                activeOpacity={0.9}
                className="bg-keystone_cream rounded-2xl py-3.5 items-center mt-4">
                <Text className="text-keystone_navy font-inter-bold text-base">
                  Pay rent — {usd(rent.amount)}
                </Text>
              </TouchableOpacity>
            )}

            <Text className="text-white/55 font-inter text-xs mt-3">
              {isPaid
                ? 'Your last payment went straight to your landlord’s bank — instantly.'
                : 'Paid the moment you tap — straight to your landlord’s bank. No fees to you, no paybill.'}
            </Text>
          </Card>
        </View>

        {/* CREDIT — rent that builds something (the tenant magnet) */}
        {credit.score ? (
          <View className="px-4 mt-3">
            <TouchableOpacity activeOpacity={0.9} onPress={() => nav.navigate('credit')}>
              <Card>
                <View className="flex-row items-center">
                  <IconChip>
                    <Icon name="trending" size={19} color={COLORS.keystone_gold} />
                  </IconChip>
                  <View className="flex-1 ml-3">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">
                      Your rent is building credit
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      {credit.streakMonths} months on time · reported to the bureaus
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-keystone_navy font-inter-bold text-lg">
                      {credit.score}
                    </Text>
                    <Text className="text-c_success font-inter-semibold text-2xs">
                      ▲ {credit.delta} pts
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* AUTOPAY nudge — only when off */}
        {!autopay.enabled && !isPaid && (
          <View className="px-4 mt-3">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => nav.navigate('pay_stack', {screen: 'autopay'})}>
              <Card style={{padding: 14}}>
                <View className="flex-row items-center">
                  <View
                    style={{backgroundColor: 'rgba(168,153,119,0.14)'}}
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <Icon name="shield" size={19} color={COLORS.keystone_gold} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">
                      Turn on autopay
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      Never think about rent again — we pay it on the due date.
                    </Text>
                  </View>
                  <Text className="text-text_muted font-inter-semibold text-base">
                    ›
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        )}

        {/* LEASE snapshot */}
        <View className="px-4 mt-4">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => nav.navigate('lease')}>
          <Card>
            <View className="flex-row items-center gap-3">
              <IconChip>
                <Icon name="lease" size={20} color={COLORS.keystone_gold} />
              </IconChip>
              <View className="flex-1">
                <Text className="text-keystone_navy font-inter-semibold text-base">
                  {lease.property}
                  {lease.unit ? ` · ${lease.unit}` : ''}
                </Text>
                <Text className="text-text_muted font-inter text-xs mt-0.5">
                  {lease.address}
                </Text>
              </View>
            </View>

            <Divider style={{marginTop: 14, marginBottom: 12}} />

            <View className="flex-row">
              <Stat label="Monthly rent" value={usd(lease.monthlyRent)} />
              <View className="w-px bg-keystone_hairline" />
              <Stat
                label="Deposit held"
                value={usd(lease.deposit)}
                align="left"
                style={{paddingLeft: 14}}
              />
              <View className="w-px bg-keystone_hairline" />
              <Stat
                label="Lease ends"
                value={fmtDate(lease.endDate)}
                sub={lease.daysToEnd ? `in ${lease.daysToEnd} days` : null}
                align="right"
              />
            </View>

            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-text_muted font-inter text-xs">
                Managed by {lease.landlord}
              </Text>
              <Text className="text-keystone_gold font-inter-semibold text-xs">
                View lease ›
              </Text>
            </View>
          </Card>
          </TouchableOpacity>
        </View>

        {/* RECENT PAYMENTS */}
        {payments.length > 0 && (
          <View className="px-4 mt-4">
            <Card style={{paddingVertical: 6}}>
              <View className="px-3 pt-2 pb-1 flex-row items-center justify-between">
                <Label>Payment history</Label>
                <TouchableOpacity onPress={() => nav.navigate('receipts')}>
                  <Text className="text-keystone_gold font-inter-semibold text-xs">
                    See all
                  </Text>
                </TouchableOpacity>
              </View>
              {payments.map((p, i) => (
                <View key={p.id}>
                  {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                  <PaymentRow item={p} />
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* QUICK ACCESS */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Quick access
          </Text>
          <View className="flex-row flex-wrap -m-1">
            <Quick
              icon="card"
              label="Pay rent"
              sub="Instant · direct"
              onPress={goPay}
            />
            <Quick
              icon="reports"
              label="Receipts"
              sub="Every payment"
              onPress={() => nav.navigate('receipts')}
            />
            <Quick
              icon="lease"
              label="My lease"
              sub="Terms & documents"
              onPress={() => nav.navigate('lease')}
            />
            <Quick
              icon="collection"
              label="Statements"
              sub="Charges & credits"
              onPress={() => nav.navigate('statements')}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const NeedRow = ({item}) => {
  const accent = item.tone === 'danger' ? COLORS.c_danger : COLORS.c_pending;
  const bg = item.tone === 'danger' ? 'rgba(229,53,53,0.10)' : 'rgba(205,160,0,0.12)';
  return (
    <TouchableOpacity onPress={item.onPress} activeOpacity={0.7} className="flex-row items-center px-3 py-3">
      <View style={{backgroundColor: bg}} className="w-9 h-9 rounded-lg items-center justify-center mr-3">
        <Icon name={item.icon} size={18} color={accent} />
      </View>
      <View className="flex-1">
        <Text className="text-keystone_navy font-inter-semibold text-sm">{item.text}</Text>
        <Text className="text-text_muted font-inter text-xs mt-0.5">{item.hint}</Text>
      </View>
      <Text className="text-text_muted font-inter-semibold text-base">›</Text>
    </TouchableOpacity>
  );
};

const PaymentRow = ({item}) => (
  <View className="flex-row items-center px-3 py-2.5">
    <View
      style={{backgroundColor: COLORS.keystone_chip}}
      className="w-9 h-9 rounded-lg items-center justify-center mr-3">
      <Icon name="card" size={17} color={COLORS.c_success} />
    </View>
    <View className="flex-1">
      <Text className="text-keystone_navy font-inter-semibold text-sm">
        Rent · {item.period}
      </Text>
      <Text className="text-text_muted font-inter text-xs mt-0.5">
        {fmtDate(item.date)} · {item.method}
      </Text>
    </View>
    <View className="items-end">
      <Text className="text-keystone_navy font-inter-bold text-sm">
        {usd(item.amount)}
      </Text>
      <Text className="text-c_success font-inter-medium text-2xs mt-0.5 uppercase tracking-wider">
        Paid
      </Text>
    </View>
  </View>
);

const Quick = ({icon, label, sub, onPress}) => (
  <TouchableOpacity onPress={onPress} className="w-1/2 p-1" activeOpacity={0.85}>
    <Card style={{padding: 16, borderRadius: 18}}>
      <IconChip size={38}>
        <Icon name={icon} size={19} />
      </IconChip>
      <Text className="text-keystone_navy font-inter-semibold text-base mt-3">
        {label}
      </Text>
      <Text className="text-text_muted font-inter text-xs mt-0.5">{sub}</Text>
    </Card>
  </TouchableOpacity>
);

export default TenantHome;
