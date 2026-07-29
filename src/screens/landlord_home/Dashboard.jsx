import React from 'react';
import {
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDashboard, useAuth, usePaymentZones, useLeaseExpiry} from '../../hooks';
import {useMaintenance} from '../../hooks/useMaintenance';
import {useComplianceAlerts} from '../../hooks/useCompliance';
import {mockScreening} from '../../services/mocks';
import {pct} from '../../utils/money';
import {normalizeDashboard} from '../../utils/dashboardShape';
import {
  Card,
  IconChip,
  Avatar,
  Label,
  Divider,
  ProgressBar,
  Stat,
  Icon,
  KSTile,
} from '../../components/premium';
import {
  HeroCard,
  Screen,
  SectionLabel,
  collectionLabel,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Landlord Dashboard — exception-first hub (design 2b). Hero rebuilt
// on the 1b contract with the Rent Collection stats merged INTO it —
// one money surface instead of two stacked cards repeating the same
// number. The floating "+$48,200 today" pill became the TODAY stat.
// Quick Access cut (duplicated the tab bar); Portfolio card moved to
// Reports (2i). Copy follows D1 so the header label and greeting can
// never disagree about the month.

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
  const greeting =
    hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  // D1 coherence: greeting and hero label derive from the same month.
  const monthName = now.toLocaleDateString('en-US', {month: 'long'});

  const collectedPct = dashboard?.month?.percentCollected ?? 0;
  const monthFeel =
    collectedPct >= 95
      ? "You're nearly all collected for the month — beautifully on top of it."
      : collectedPct >= 85
        ? `${monthName}'s looking strong. You're well ahead on rent.`
        : collectedPct >= 65
          ? "Rent's coming in steadily this month."
          : 'Early in the month — collections are just getting going.';

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
    // Screening (4b): report-ready surfaces as a needs-you row, not a tab.
    ...(() => {
      const ready = mockScreening.applications.filter(
        a => a.status === 'REPORT_READY',
      ).length;
      return ready > 0
        ? [
            {
              icon: 'users',
              tone: 'pending',
              text: `${ready} screening ${ready === 1 ? 'report is' : 'reports are'} ready`,
              hint: `${mockScreening.unit.unitName} — review and decide`,
              onPress: () =>
                nav.navigate('leases_stack', {screen: 'screening'}),
            },
          ]
        : [];
    })(),
  ].filter(Boolean);

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
      <Text className="text-text_muted font-inter text-xs">{dateLabel}</Text>
      <Text
        className="text-keystone_navy font-inter-bold mt-1"
        style={{fontSize: 34, lineHeight: 40, letterSpacing: -0.3}}>
        {greeting}
        {firstName ? `, ${firstName}` : ''}.
      </Text>
      <Text className="text-keystone_slate font-inter text-base mt-2 mb-5 leading-5">
        {monthFeel}
      </Text>

      {/* NEEDS YOU */}
      <SectionLabel>
        {needs.length > 0 ? `Needs you · ${needs.length}` : 'Needs you'}
      </SectionLabel>
      <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
        {needs.length === 0 ? (
          <View className="py-4 flex-row items-center gap-3">
            <Text style={{fontSize: 20}}>☕</Text>
            <Text className="text-text_muted font-inter text-sm flex-1">
              Nothing needs you right now. Keystone’s handling the rest.
            </Text>
          </View>
        ) : (
          needs.map((n, i) => (
            <NeedRow key={n.text} item={n} last={i === needs.length - 1} />
          ))
        )}
      </Card>

      {/* HERO — one money surface: received + collection stats (2b) */}
      <View className="mt-4">
        <HeroCard
          label={collectionLabel(now)}
          badge={{text: 'Instant · Direct', dot: 'success'}}
          amount={usd(monthReceived)}
          sub={`collected of ${usd(monthExpected)} expected · ${pct(monthPercent)}`}>
          <View style={{marginTop: 12}}>
            <ProgressBar percent={monthPercent} onDark />
          </View>
          {/* 2b: stats stay cream — the navy card carries no semantic
              color; only today's inflow is marked with a "+". */}
          <View className="flex-row mt-4">
            <Stat label="Today" value={`+${usd(collectedToday)}`} onDark />
            <View style={{width: 1, backgroundColor: 'rgba(231,229,218,0.14)'}} />
            <Stat
              label="Pending"
              value={usd(monthPending)}
              onDark
              align="left"
              style={{paddingLeft: 14}}
            />
            <View style={{width: 1, backgroundColor: 'rgba(231,229,218,0.14)'}} />
            <Stat
              label="Outstanding"
              value={usd(outstandingAmt)}
              sub={outstandingUnits ? `${outstandingUnits} units` : null}
              onDark
              align="right"
            />
          </View>
          <Text
            numberOfLines={2}
            className="font-inter text-xs mt-4"
            style={{color: 'rgba(231,229,218,0.72)'}}>
            Paid straight to your bank the moment a tenant pays — no holding
            account.
          </Text>
        </HeroCard>
      </View>

      {/* RECENT ACTIVITY */}
      {dashboard?.recentActivity?.length > 0 && (
        <View className="mt-4">
          <SectionLabel
            right={
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-c_success" />
                <Text className="text-text_muted font-inter text-2xs uppercase tracking-wider">
                  live
                </Text>
              </View>
            }>
            Recent activity
          </SectionLabel>
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            {dashboard.recentActivity.map((a, i) => (
              <ActivityRow
                key={a.id}
                item={a}
                last={i === dashboard.recentActivity.length - 1}
              />
            ))}
          </Card>
        </View>
      )}

      {isPending && !dashboard && (
        <View className="items-center py-8">
          <Text className="text-text_muted font-inter">Loading…</Text>
        </View>
      )}
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

const ActivityRow = ({item, last}) => {
  const cfg = ACTIVITY[item.type] ?? ACTIVITY.PAYMENT;
  const title =
    item.type === 'LATE_FEE' ? `Late fee · ${item.tenant}` : `Rent · ${item.tenant}`;
  return (
    <View
      className="flex-row items-center py-3"
      style={
        !last && {
          borderBottomWidth: 0.5,
          borderBottomColor: COLORS.keystone_hairline,
        }
      }>
      <IconChip size={40}>
        <Icon name={cfg.icon} size={17} color={cfg.tint} />
      </IconChip>
      <View className="flex-1 ml-3" style={{minWidth: 0}}>
        <Text
          numberOfLines={1}
          className="text-keystone_navy font-inter-semibold text-sm">
          {title}
        </Text>
        {/* D2: verb-dated meta */}
        <Text numberOfLines={1} className="text-text_muted font-inter text-xs mt-0.5">
          {item.unit} · paid {timeAgo(item.minutesAgo)}
        </Text>
      </View>
      <Text style={{color: cfg.tint, fontVariant: ['tabular-nums']}} className="font-inter-bold text-sm">
        {cfg.prefix}
        {usd(item.amount)}
      </Text>
    </View>
  );
};

export default Dashboard;
