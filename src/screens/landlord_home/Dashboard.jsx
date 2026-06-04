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
import {useDashboard, useAuth} from '../../hooks';
import {useMaintenance} from '../../hooks/useMaintenance';
import {useComplianceAlerts} from '../../hooks/useCompliance';
import {usd, usdCents, pct} from '../../utils/money';
import {
  Card,
  IconChip,
  Avatar,
  Label,
  Amount,
  Divider,
  ProgressBar,
  Stat,
  StatusPill,
  Icon,
  Sparkline,
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
  const {profile} = useAuth();
  const nav = useNavigation();

  const pendingCompliance = complianceAlerts.filter(
    a => a.status === 'NOT_SENT',
  ).length;
  const overdue = maint?.overdue ?? 0;

  const firstName = profile?.firstName ?? 'Landlord';
  const initials = `${(profile?.firstName ?? 'L')[0] ?? ''}${
    (profile?.lastName ?? '')[0] ?? ''
  }`.toUpperCase();

  const monthLabel = new Date()
    .toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
    .toUpperCase();
  const updatedMins = dashboard?.cashAccount?.updatedAt
    ? Math.max(
        0,
        Math.round(
          (Date.now() - new Date(dashboard.cashAccount.updatedAt).getTime()) /
            60000,
        ),
      )
    : null;

  const collectedToday = dashboard?.today?.collected ?? 0;
  const expectedToday = dashboard?.today?.expected ?? 0;
  const outstandingToday = expectedToday - collectedToday;

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
        {/* Header */}
        <View className="px-5 pt-14 pb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-keystone_gold font-inter-semibold text-xs tracking-widest uppercase">
              Good morning
            </Text>
            <Text className="text-keystone_navy font-inter-bold text-3xl mt-1">
              {firstName}
            </Text>
          </View>
          <Avatar initials={initials} size={48} />
        </View>

        {/* Action flags — refined cards, only when he must act */}
        {pendingCompliance > 0 && (
          <Flag
            tone="pending"
            icon="scale"
            title={`${pendingCompliance} compliance notice${
              pendingCompliance === 1 ? '' : 's'
            } to send`}
            sub="Statutory deadline approaching"
            onPress={() =>
              nav.navigate('reports_stack', {screen: 'compliance'})
            }
          />
        )}
        {overdue > 0 && (
          <Flag
            tone="danger"
            icon="wrench"
            title={`${overdue} maintenance overdue`}
            sub="Needs your attention"
            onPress={() =>
              nav.navigate('reports_stack', {screen: 'maintenance'})
            }
          />
        )}

        {/* CASH — the navy feature card */}
        <View className="px-4 mt-1">
          <Card feature>
            <View className="flex-row items-center justify-between">
              <Label onDark>Cash available now</Label>
              <View className="flex-row items-center gap-2">
                <View className="w-1.5 h-1.5 rounded-full bg-c_success" />
                <Text className="text-white/70 font-inter-medium text-2xs uppercase tracking-wider">
                  {dashboard?.cashAccount?.bankName ?? 'Bank'}
                </Text>
              </View>
            </View>

            <Amount size="xl" onDark style={{marginTop: 12}}>
              {usdCents(dashboard?.cashAccount?.balance)}
            </Amount>

            <View className="flex-row items-center justify-between mt-3">
              <View>
                <Text className="text-white/60 font-inter text-xs">
                  Business ····{dashboard?.cashAccount?.accountLast4 ?? '—'}
                </Text>
                {updatedMins !== null && (
                  <Text className="text-white/40 font-inter text-2xs mt-0.5">
                    updated {updatedMins}m ago
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() =>
                  nav.navigate('payments_stack', {screen: 'payout'})
                }
                activeOpacity={0.85}
                className="bg-keystone_gold rounded-full px-5 py-2.5">
                <Text className="text-keystone_navy font-inter-semibold text-xs uppercase tracking-wider">
                  Move money
                </Text>
              </TouchableOpacity>
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
                  {pct(dashboard?.month?.percentCollected)}
                </Text>
              </View>
            </View>

            <Amount size="xl" style={{marginTop: 16}}>
              {usd(dashboard?.month?.collected)}
            </Amount>
            <Text className="text-text_muted font-inter text-sm mt-1">
              collected of {usd(dashboard?.month?.expected)} expected
            </Text>

            <ProgressBar
              percent={dashboard?.month?.percentCollected ?? 0}
              style={{marginTop: 16}}
            />

            <Divider style={{marginTop: 18, marginBottom: 14}} />

            <View className="flex-row">
              <Stat label="Today" value={usd(collectedToday)} />
              <View className="w-px bg-keystone_hairline" />
              <Stat
                label="Pending"
                value={usd(dashboard?.month?.pending)}
                valueColor={COLORS.c_pending}
                align="left"
                style={{paddingLeft: 14}}
              />
              <View className="w-px bg-keystone_hairline" />
              <Stat
                label="Outstanding"
                value={usd(outstandingToday)}
                sub={
                  dashboard?.today?.outstandingUnits
                    ? `${dashboard.today.outstandingUnits} units`
                    : null
                }
                valueColor={COLORS.c_danger}
                align="right"
              />
            </View>
          </Card>
        </View>

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

const Flag = ({tone, icon, title, sub, onPress}) => {
  const accent =
    tone === 'danger' ? COLORS.c_danger : COLORS.c_pending;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} className="mx-4 mb-3">
      <Card style={{padding: 14, borderLeftWidth: 3, borderLeftColor: accent}}>
        <View className="flex-row items-center gap-3">
          <View
            style={{backgroundColor: tone === 'danger' ? 'rgba(229,53,53,0.10)' : 'rgba(205,160,0,0.12)'}}
            className="w-9 h-9 rounded-lg items-center justify-center">
            <Icon name={icon} size={18} color={accent} />
          </View>
          <View className="flex-1">
            <Text className="text-keystone_navy font-inter-semibold text-sm">
              {title}
            </Text>
            <Text className="text-text_muted font-inter text-xs mt-0.5">
              {sub}
            </Text>
          </View>
          <Text style={{color: accent}} className="font-inter-semibold text-base">
            →
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
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
