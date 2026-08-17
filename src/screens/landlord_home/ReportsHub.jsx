import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useDashboard} from '../../hooks';
import {useMaintenance} from '../../hooks/useMaintenance';
import {useComplianceAlerts} from '../../hooks/useCompliance';
import {normalizeDashboard} from '../../utils/dashboardShape';
import {Card, ProgressBar, Stat} from '../../components/premium';
import {HeroCard, ListRow, Screen, SectionLabel} from '../../components/kit';
import {usdCompact} from '../../components/kit/money';

// Reports hub (design 2i): the Portfolio card moves here from the old
// Dashboard as the hero — the tab answers "how's the portfolio?"
// before offering drill-downs. Menu rows carry count chips where a
// number is waiting inside (1 LATE, 2 DUE) so exceptions surface
// without a tap. Donut dropped — one gold occupancy bar (F5).

// Was a third `usd` implementation. Delegates now, so it cannot drift
// from the one every other surface uses.
const kUsd = usdCompact;

const ReportsHub = () => {
  const nav = useNavigation();
  const {dashboard} = useDashboard();
  const {summary: maint} = useMaintenance();
  const {alerts} = useComplianceAlerts();

  const portfolio = dashboard?.portfolio ?? {};
  const {monthExpected} = normalizeDashboard(dashboard);
  const overdue = maint?.overdue ?? 0;
  const noticesDue = alerts.filter(a => a.status === 'NOT_SENT').length;
  const monthLabel = new Date()
    .toLocaleDateString('en-US', {month: 'long'})
    .toUpperCase();

  return (
    <Screen variant="hub" contentStyle={{paddingTop: 16}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text
        className="text-keystone_navy font-inter-bold"
        style={{fontSize: 34, lineHeight: 40, letterSpacing: -0.3}}>
        Reports
      </Text>
      <Text className="text-keystone_slate font-inter text-base mt-1 mb-5">
        The numbers your accountant asks for.
      </Text>

      {/* Portfolio hero — navy: gross rent is money (2i) */}
      <HeroCard
        label={`Portfolio · ${monthLabel}`}
        badge={
          portfolio.properties
            ? {text: `${portfolio.properties} properties`}
            : undefined
        }>
        <View className="flex-row mt-3">
          <Stat
            label="Occupancy"
            value={`${portfolio.occupancyRate ?? '—'}%`}
            onDark
          />
          <Stat
            label="Units"
            value={`${portfolio.occupied ?? '—'}`}
            unit={portfolio.units ? `/${portfolio.units}` : null}
            onDark
            align="left"
            style={{paddingLeft: 14}}
          />
          <Stat
            label="Gross rent"
            value={kUsd(monthExpected)}
            onDark
            align="right"
          />
        </View>
        <ProgressBar
          percent={portfolio.occupancyRate ?? 0}
          onDark
          style={{marginTop: 14}}
        />
        <Text
          className="font-inter text-xs mt-3"
          style={{color: 'rgba(231,229,218,0.72)'}}>
          {portfolio.vacant ?? 0} vacant unit
          {(portfolio.vacant ?? 0) === 1 ? '' : 's'}
        </Text>
      </HeroCard>

      {/* Drill-downs */}
      <View className="mt-5">
        <SectionLabel>Reports</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          <ListRow
            icon="trending"
            title="Portfolio performance"
            sub="Gross rent, vacancy, occupancy by property"
            chevron
            onPress={() => nav.navigate('portfolio')}
          />
          <ListRow
            icon="reports"
            title="Statements"
            sub="Accountant-ready financials & tax summary"
            chevron
            onPress={() => nav.navigate('owner_reports')}
          />
          <ListRow
            icon="wrench"
            title="Maintenance"
            sub="Open / overdue counts · read-only"
            chip={
              overdue > 0 ? {label: `${overdue} late`, tone: 'danger'} : undefined
            }
            chevron={overdue === 0}
            onPress={() => nav.navigate('maintenance')}
          />
          <ListRow
            icon="shield"
            title="Rent insurance"
            sub="Coverage, claims, payouts"
            chevron
            onPress={() => nav.navigate('insurance')}
          />
          <ListRow
            icon="scale"
            title="Compliance alerts"
            sub="Notices due — Washington HB 1217 + others"
            chip={
              noticesDue > 0
                ? {label: `${noticesDue} due`, tone: 'pending'}
                : undefined
            }
            chevron={noticesDue === 0}
            last
            onPress={() => nav.navigate('compliance')}
          />
        </Card>
      </View>
    </Screen>
  );
};

export default ReportsHub;
