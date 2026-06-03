import React from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDashboard, useAuth} from '../../hooks';
import {useMaintenance} from '../../hooks/useMaintenance';
import {useComplianceAlerts} from '../../hooks/useCompliance';
import {usd, usdCents, pct} from '../../utils/money';

// The morning number — the screen the landlord opens at 7 AM with his
// coffee. Three sections, no nav required:
//   1. Today's collection (collected / expected / outstanding)
//   2. This month's collection (collected / pending + % bar)
//   3. Cash in bank account right now (Dwolla balance proxy)
//
// Every other landlord screen is reached from the quick-action grid
// below the cash card — but if the landlord never scrolls, he should
// already know his world. That's the design constraint.

const Dashboard = () => {
  const {dashboard, isPending, isRefetching, refetch} = useDashboard();
  const {summary: maint} = useMaintenance();
  const {alerts: complianceAlerts} = useComplianceAlerts();
  const {profile} = useAuth();
  const nav = useNavigation();
  const pendingCompliance = complianceAlerts.filter(
    a => a.status === 'NOT_SENT',
  ).length;

  const monthLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const updatedMins = dashboard?.cashAccount?.updatedAt
    ? Math.max(
        0,
        Math.round(
          (Date.now() - new Date(dashboard.cashAccount.updatedAt).getTime()) /
            60000,
        ),
      )
    : null;

  return (
    <ScrollView
      className="flex-1 bg-keystone_stone"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }>
      {/* Header */}
      <View className="px-5 pt-6 pb-4 bg-keystone_navy">
        <Text className="text-keystone_cream font-inter text-xs uppercase tracking-widest">
          Good morning
        </Text>
        <Text className="text-white font-inter-bold text-2xl mt-1">
          {profile?.firstName ?? 'Landlord'}
        </Text>
      </View>

      {/* Compliance banner — same flag-not-list principle. */}
      {pendingCompliance > 0 && (
        <TouchableOpacity
          onPress={() => nav.navigate('reports_stack', {screen: 'compliance'})}
          activeOpacity={0.8}
          className="mx-4 mt-4 bg-keystone_gold/15 border-l-4 border-keystone_gold rounded-2xl p-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-keystone_navy font-inter-semibold text-sm">
              ⚠ {pendingCompliance} compliance notice
              {pendingCompliance === 1 ? '' : 's'} need to be sent
            </Text>
            <Text className="text-grey_1 font-inter text-xs mt-1">
              Tap to review and dispatch
            </Text>
          </View>
          <Text className="text-keystone_navy font-inter-semibold">→</Text>
        </TouchableOpacity>
      )}

      {/* Maintenance red-flag banner — surfaces only if there's an
          overdue item. The landlord responds to flags, not lists. */}
      {(maint?.overdue ?? 0) > 0 && (
        <TouchableOpacity
          onPress={() => nav.navigate('reports_stack', {screen: 'maintenance'})}
          activeOpacity={0.8}
          className="mx-4 mt-4 bg-[#EF4444]/10 border-l-4 border-[#EF4444] rounded-2xl p-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[#EF4444] font-inter-semibold text-sm">
              {maint.overdue} maintenance overdue
            </Text>
            <Text className="text-grey_1 font-inter text-xs mt-1">
              Tap to see what needs your attention
            </Text>
          </View>
          <Text className="text-[#EF4444] font-inter-semibold">→</Text>
        </TouchableOpacity>
      )}

      {/* SECTION 1 — Today's collection */}
      <View className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-keystone_navy font-inter-semibold text-sm tracking-wide uppercase">
          {monthLabel} Rent Collection
        </Text>
        <View className="h-px bg-keystone_cream my-3" />

        <Row
          label="Collected today"
          value={usd(dashboard?.today?.collected)}
          valueClass="text-keystone_navy"
        />
        <Row
          label="Expected today"
          value={usd(dashboard?.today?.expected)}
          valueClass="text-grey_1"
        />
        <Row
          label="Outstanding"
          value={usd(
            (dashboard?.today?.expected ?? 0) -
              (dashboard?.today?.collected ?? 0),
          )}
          rightTag={
            dashboard?.today?.outstandingUnits > 0
              ? `${dashboard.today.outstandingUnits} units`
              : null
          }
          valueClass="text-[#EF4444]"
        />

        <View className="h-px bg-keystone_cream my-4" />

        <Text className="text-grey_1 font-inter-medium text-xs uppercase tracking-wider mb-3">
          Overall this month
        </Text>
        <Row
          label="Collected"
          value={usd(dashboard?.month?.collected)}
          rightTag={`${pct(dashboard?.month?.percentCollected)}`}
          valueClass="text-keystone_navy"
        />
        <Row
          label="Pending"
          value={usd(dashboard?.month?.pending)}
          rightTag={`${pct(dashboard?.month?.percentPending)}`}
          valueClass="text-keystone_gold"
        />
        <ProgressBar percent={dashboard?.month?.percentCollected ?? 0} />
      </View>

      {/* SECTION 2 — Cash in account */}
      <View className="mx-4 mt-4 bg-keystone_navy rounded-2xl p-5">
        <Text className="text-keystone_cream font-inter text-xs uppercase tracking-widest">
          Cash in account right now
        </Text>
        <Text className="text-white font-inter-semibold text-sm mt-2">
          {dashboard?.cashAccount?.bankName ?? 'Bank account'} ****
          {dashboard?.cashAccount?.accountLast4 ?? '—'}
        </Text>
        <Text className="text-white font-inter-bold text-3xl mt-2">
          {usdCents(dashboard?.cashAccount?.balance)}
        </Text>
        {updatedMins !== null && (
          <Text className="text-keystone_cream font-inter text-xs mt-1 opacity-80">
            ↑ updated {updatedMins} min{updatedMins === 1 ? '' : 's'} ago
          </Text>
        )}
      </View>

      {/* SECTION 3 — Quick-action grid (drill-downs to other tabs) */}
      <View className="mx-4 mt-4 mb-8 flex-row flex-wrap -m-1">
        <QuickAction
          label="Payments"
          subtitle="Who paid / who hasn't"
          onPress={() => nav.navigate('payments_stack')}
        />
        <QuickAction
          label="Leases"
          subtitle="Expiring soon"
          onPress={() => nav.navigate('leases_stack')}
        />
        <QuickAction
          label="Reports"
          subtitle="Portfolio + owners"
          onPress={() => nav.navigate('reports_stack')}
        />
        <QuickAction
          label="Payout"
          subtitle="Send to bank now"
          onPress={() => nav.navigate('payments_stack', {screen: 'payout'})}
        />
      </View>
      {isPending && (
        <View className="absolute inset-0 items-center justify-center bg-white/60">
          <Text className="text-keystone_navy font-inter">Loading…</Text>
        </View>
      )}
    </ScrollView>
  );
};

const Row = ({label, value, valueClass, rightTag}) => (
  <View className="flex-row items-center justify-between py-2">
    <Text className="text-grey_1 font-inter text-sm">{label}</Text>
    <View className="flex-row items-center gap-2">
      <Text className={`font-inter-semibold text-base ${valueClass ?? 'text-keystone_navy'}`}>
        {value}
      </Text>
      {rightTag && (
        <Text className="text-grey_1 font-inter text-xs">{rightTag}</Text>
      )}
    </View>
  </View>
);

const ProgressBar = ({percent}) => (
  <View className="mt-3 h-2 bg-keystone_cream rounded-full overflow-hidden">
    <View
      style={{
        width: `${Math.max(0, Math.min(100, percent))}%`,
      }}
      className="h-2 bg-keystone_navy"
    />
  </View>
);

const QuickAction = ({label, subtitle, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    className="w-1/2 p-1"
    activeOpacity={0.7}>
    <View className="bg-white rounded-2xl p-4 shadow-sm">
      <Text className="text-keystone_navy font-inter-semibold text-base">
        {label}
      </Text>
      <Text className="text-grey_1 font-inter text-xs mt-1">{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export default Dashboard;
