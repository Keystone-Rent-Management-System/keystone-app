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
import {useDashboard, useAuth, usePaymentZones, useLeaseExpiry} from '../../hooks';
import {useMaintenance} from '../../hooks/useMaintenance';
import {useComplianceAlerts} from '../../hooks/useCompliance';
import {usd, pct} from '../../utils/money';
import {normalizeDashboard} from '../../utils/dashboardShape';
import {
  Card,
  IconChip,
  Avatar,
  Label,
  Amount,
  AnimatedAmount,
  Divider,
  ProgressBar,
  Stat,
  StatusPill,
  Icon,
  Sparkline,
  Ring,
  FadeScaleIn,
  KeystoneLogo,
} from '../../components/premium';
import COLORS from '../../constants/Theme';

// The morning command center — brand-matched to the Keystone web UI.
// Light canvas, white cards with cream chips and navy values, a single
// navy feature card for cash-on-hand, gold accents. He opens this at
// 7 AM and knows his world in 10 seconds.

const Dashboard = () => {
  const {dashboard, isPending, isRefetching, refetch} = useDashboard();
  const {summary: maint} = useMaintenance();
  const {alerts: complianceAlerts} = useComplianceAlerts();
  const {summary: zones} = usePaymentZones();
  const {expiring} = useLeaseExpiry();
  const {profile} = useAuth();
  const nav = useNavigation();

  const pendingCompliance = complianceAlerts.filter(
    a => a.status === 'NOT_SENT',
  ).length;
  const overdue = maint?.overdue ?? 0;
  const unpaid = zones?.find(z => z.key === 'notPaid')?.count ?? 0;
  const renewalsDue = expiring.filter(u => u.renewalStatus === 'NOT_SENT').length;

  const firstName = profile?.firstName ?? '';
  const initials = `${(profile?.firstName ?? 'L')[0] ?? ''}${
    (profile?.lastName ?? '')[0] ?? ''
  }`.toUpperCase();

  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // A warm, human read of the month — spoken like a person, not a
  // dashboard. Busy landlords want reassurance, not just numbers.
  const collectedPct = dashboard?.month?.percentCollected ?? 0;
  const monthFeel =
    collectedPct >= 95
      ? "You're nearly all collected for the month — beautifully on top of it."
      : collectedPct >= 85
        ? "June's looking strong. You're well ahead on rent."
        : collectedPct >= 65
          ? "Rent's coming in steadily this month."
          : "Early in the month — collections are just getting going.";

  // The few things that actually need him — pulled from across hundreds
  // of units and said in plain language. This is the whole point: he
  // shouldn't have to go hunting.
  const needs = [
    unpaid > 0 && {
      icon: 'card',
      tone: 'danger',
      text: `${unpaid} ${unpaid === 1 ? 'tenant hasn’t' : 'tenants haven’t'} paid yet`,
      hint: 'Keystone already sent reminders',
      onPress: () => nav.navigate('payments_stack'),
    },
    renewalsDue > 0 && {
      icon: 'lease',
      tone: 'pending',
      text: `${renewalsDue} ${renewalsDue === 1 ? 'lease is' : 'leases are'} up for renewal`,
      hint: 'A renewal hasn’t been sent yet',
      onPress: () => nav.navigate('leases_stack'),
    },
    pendingCompliance > 0 && {
      icon: 'scale',
      tone: 'pending',
      text: `${pendingCompliance} ${pendingCompliance === 1 ? 'notice' : 'notices'} to send before the deadline`,
      hint: 'Washington — we’ll write them for you',
      onPress: () => nav.navigate('reports_stack', {screen: 'compliance'}),
    },
    overdue > 0 && {
      icon: 'wrench',
      tone: 'danger',
      text: `${overdue} ${overdue === 1 ? 'repair is' : 'repairs are'} running late`,
      hint: 'Your PM has been notified',
      onPress: () => nav.navigate('reports_stack', {screen: 'maintenance'}),
    },
  ].filter(Boolean);
  const monthLabel = now
    .toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
    .toUpperCase();
  // Map both the nested mock shape and the flat live B79 shape into one
  // set of fields the cards read (so the Collection card renders against
  // the real endpoint, not only the mock). Rent is paid instantly +
  // directly to the landlord's bank — no escrow / held balance, so there
  // is no "available balance" and nothing to "move".
  const {
    monthReceived,
    monthExpected,
    monthPercent,
    monthPending,
    collectedToday,
    outstandingAmt,
    outstandingUnits,
  } = normalizeDashboard(dashboard);

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

        {/* Warm, human greeting */}
        <View className="px-5 pt-6 pb-4">
          <Text className="text-text_muted font-inter text-xs">{dateLabel}</Text>
          <Text className="text-keystone_navy font-inter-bold text-3xl mt-1">
            {greeting}
            {firstName ? `, ${firstName}` : ''}.
          </Text>
          <Text className="text-keystone_slate font-inter text-base mt-2 leading-5">
            {monthFeel}
          </Text>
        </View>

        {/* Needs you — the one place he looks to know what's on his plate */}
        <View className="px-4 mb-1">
          <Card style={{padding: 6}}>
            <View className="px-3 pt-3 pb-1 flex-row items-center justify-between">
              <Text className="text-keystone_navy font-inter-semibold text-base">
                {needs.length > 0 ? 'A few things need you' : 'You’re all caught up'}
              </Text>
              {needs.length > 0 && (
                <View className="bg-keystone_chip rounded-full w-6 h-6 items-center justify-center">
                  <Text className="text-keystone_navy font-inter-bold text-xs">
                    {needs.length}
                  </Text>
                </View>
              )}
            </View>
            {needs.length === 0 ? (
              <View className="px-3 py-4 flex-row items-center gap-3">
                <Text style={{fontSize: 20}}>☕</Text>
                <Text className="text-text_muted font-inter text-sm flex-1">
                  Nothing needs you right now. Keystone’s handling the rest.
                </Text>
              </View>
            ) : (
              needs.map((n, i) => (
                <View key={i}>
                  {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                  <NeedRow item={n} />
                </View>
              ))
            )}
          </Card>
        </View>

        {/* RENT RECEIVED — the navy feature card. Keystone pays rent
            instantly + directly into the landlord's own bank: there is
            no escrow / platform-held balance, so this is a record of
            money already in their account, NOT a balance to move. */}
        <View className="px-4 mt-1">
          <Card feature>
            <View className="flex-row items-center justify-between">
              <Label onDark>Rent received this month</Label>
              <View className="flex-row items-center gap-2">
                <View className="w-1.5 h-1.5 rounded-full bg-c_success" />
                <Text className="text-white/70 font-inter-medium text-2xs uppercase tracking-wider">
                  Instant · Direct
                </Text>
              </View>
            </View>

            <AnimatedAmount
              value={monthReceived}
              format={usd}
              size="xl"
              onDark
              style={{marginTop: 12}}
            />

            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-white/60 font-inter text-xs flex-1 pr-3">
                Paid straight to your bank the moment a tenant pays — no
                holding account, nothing to move.
              </Text>
              {collectedToday > 0 && (
                <View className="bg-white/10 rounded-full px-3 py-2">
                  <Text className="text-c_success font-inter-semibold text-xs">
                    +{usd(collectedToday)} today
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* COLLECTION — white card */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconChip>
                  <Icon name="collection" size={20} color={COLORS.keystone_gold} />
                </IconChip>
                <View>
                  <Label>Rent Collection</Label>
                  <Text className="text-text_muted font-inter text-xs mt-0.5">
                    {monthLabel}
                  </Text>
                </View>
              </View>
              <View className="bg-keystone_chip rounded-full px-3 py-1">
                <Text className="text-keystone_gold font-inter-bold text-sm">
                  {pct(monthPercent)}
                </Text>
              </View>
            </View>

            <AnimatedAmount
              value={monthReceived}
              format={usd}
              size="xl"
              style={{marginTop: 16}}
            />
            <Text className="text-text_muted font-inter text-sm mt-1">
              collected of {usd(monthExpected)} expected
            </Text>

            <ProgressBar percent={monthPercent} style={{marginTop: 16}} />

            <Divider style={{marginTop: 18, marginBottom: 14}} />

            <View className="flex-row">
              <Stat label="Today" value={usd(collectedToday)} />
              <View className="w-px bg-keystone_hairline" />
              <Stat
                label="Pending"
                value={usd(monthPending)}
                valueColor={COLORS.c_pending}
                align="left"
                style={{paddingLeft: 14}}
              />
              <View className="w-px bg-keystone_hairline" />
              <Stat
                label="Outstanding"
                value={usd(outstandingAmt)}
                sub={outstandingUnits ? `${outstandingUnits} units` : null}
                valueColor={COLORS.c_danger}
                align="right"
              />
            </View>
          </Card>
        </View>

        {/* PORTFOLIO SNAPSHOT */}
        {dashboard?.portfolio && (
          <View className="px-4 mt-4">
            <Card>
              <View className="flex-row items-center">
                <Ring
                  percent={dashboard.portfolio.occupancyRate}
                  size={96}
                  thickness={9}
                  centerValue={`${dashboard.portfolio.occupancyRate}%`}
                  centerLabel="occupied"
                />
                <View className="flex-1 ml-4">
                  <Label>Portfolio</Label>
                  <View className="flex-row mt-3">
                    <Stat label="Properties" value={`${dashboard.portfolio.properties}`} />
                    <Stat label="Units" value={`${dashboard.portfolio.units}`} align="left" style={{paddingLeft: 8}} />
                  </View>
                  <View className="flex-row mt-3">
                    <Stat label="Occupied" value={`${dashboard.portfolio.occupied}`} valueColor={COLORS.c_success} />
                    <Stat label="Vacant" value={`${dashboard.portfolio.vacant}`} valueColor={COLORS.c_pending} align="left" style={{paddingLeft: 8}} />
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* COLLECTION TREND */}
        {dashboard?.trend?.length > 1 && (
          <View className="px-4 mt-4">
            <Card>
              <View className="flex-row items-center justify-between mb-3">
                <Label>6-month trend</Label>
                <Text className="text-text_muted font-inter text-xs">
                  collected / month
                </Text>
              </View>
              <View className="items-center">
                <Sparkline
                  data={dashboard.trend.map(t => t.collected)}
                  width={300}
                  height={64}
                />
              </View>
              <View className="flex-row justify-between mt-2 px-0.5">
                {dashboard.trend.map(t => (
                  <Text
                    key={t.label}
                    className="text-text_muted font-inter text-2xs"
                    style={{width: 300 / dashboard.trend.length, textAlign: 'center'}}>
                    {t.label}
                  </Text>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* RECENT ACTIVITY */}
        {dashboard?.recentActivity?.length > 0 && (
          <View className="px-4 mt-4">
            <Card style={{paddingVertical: 6}}>
              <View className="px-3 pt-2 pb-1 flex-row items-center justify-between">
                <Label>Recent activity</Label>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-1.5 h-1.5 rounded-full bg-c_success" />
                  <Text className="text-text_muted font-inter text-2xs uppercase tracking-wider">
                    live
                  </Text>
                </View>
              </View>
              {dashboard.recentActivity.map((a, i) => (
                <View key={a.id}>
                  {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                  <ActivityRow item={a} />
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
            <Quick icon="card" label="Payments" sub="Who paid · who hasn't"
              onPress={() => nav.navigate('payments_stack')} />
            <Quick icon="lease" label="Leases" sub="Expiring soon"
              onPress={() => nav.navigate('leases_stack')} />
            <Quick icon="trending" label="Portfolio" sub="The owner view"
              onPress={() => nav.navigate('reports_stack', {screen: 'portfolio'})} />
            <Quick icon="reports" label="Reports" sub="Owners · insurance"
              onPress={() => nav.navigate('reports_stack')} />
          </View>
        </View>

        {isPending && (
          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-text_muted font-inter">Loading…</Text>
          </View>
        )}
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

const ACTIVITY = {
  PAYMENT: {icon: 'card', tint: COLORS.c_success, prefix: '+'},
  LATE_FEE: {icon: 'card', tint: COLORS.c_pending, prefix: '+'},
};

const timeAgo = mins => {
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const ActivityRow = ({item}) => {
  const cfg = ACTIVITY[item.type] ?? ACTIVITY.PAYMENT;
  const title =
    item.type === 'LATE_FEE'
      ? `Late fee · ${item.tenant}`
      : `Rent · ${item.tenant}`;
  const sub = item.unit;
  return (
    <View className="flex-row items-center px-3 py-2.5">
      <View
        style={{backgroundColor: COLORS.keystone_chip}}
        className="w-9 h-9 rounded-lg items-center justify-center mr-3">
        <Icon name={cfg.icon} size={17} color={cfg.tint} />
      </View>
      <View className="flex-1">
        <Text className="text-keystone_navy font-inter-semibold text-sm">{title}</Text>
        {sub ? (
          <Text className="text-text_muted font-inter text-xs mt-0.5">{sub}</Text>
        ) : null}
      </View>
      <View className="items-end">
        <Text
          style={{color: cfg.tint}}
          className="font-inter-bold text-sm">
          {cfg.prefix}
          {usd(item.amount)}
        </Text>
        <Text className="text-text_muted font-inter text-2xs mt-0.5">
          {timeAgo(item.minutesAgo)}
        </Text>
      </View>
    </View>
  );
};

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

export default Dashboard;
