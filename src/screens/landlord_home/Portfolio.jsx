import React from 'react';
import {ActivityIndicator, RefreshControl, StatusBar, Text, View} from 'react-native';
import {pct} from '../../utils/money';
import {NO_VALUE} from '../../components/kit/money';
import {useExportPortfolioPdf, usePortfolio} from '../../hooks/usePortfolio';
import {useDashboard} from '../../hooks';
import {demoOnly, mockPortfolioByProperty} from '../../services/mocks';
import {Card, Divider, Row, Delta} from '../../components/premium';
import {
  HeroCard,
  PrimaryButton,
  Screen,
  SectionLabel,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {toast} from '../../utils/toast';

// Portfolio performance (design 7a). Hero = gross rent (the owner's
// number); occupancy folds into the sub-line rather than a second
// card. Per-property rows use collection % as the health signal with
// AA semantic text colors — the weakest property is findable at a
// glance (exception-first, applied to reporting). Income statement +
// one-tap PDF export preserved.

const rateColor = r =>
  r >= 95 ? '#037147' : r >= 90 ? '#7A6100' : '#B32020';

const Portfolio = () => {
  // Per-property breakdown has no BE endpoint — /portfolio/performance
  // returns portfolio-wide totals only. Fixtures mode shows the intended
  // design; a live build shows nothing rather than invented properties.
  const byProperty = demoOnly(mockPortfolioByProperty, []);
  const {performance, isPending, isRefetching, refetch} = usePortfolio();
  const {dashboard} = useDashboard();
  const exportMut = useExportPortfolioPdf();

  const portfolio = dashboard?.portfolio ?? {};
  // Monthly totals sit within ~10% of each other, so bars are scaled
  // across the range (not from zero) or the chart reads as flat.
  const trend = dashboard?.trend ?? [];
  const trendMax = Math.max(...trend.map(t => t.collected), 1);
  const trendMin = Math.min(...trend.map(t => t.collected), trendMax);
  const barPct = v =>
    trendMax === trendMin
      ? 100
      : 45 + Math.round(((v - trendMin) / (trendMax - trendMin)) * 55);
  const monthLabel = new Date()
    .toLocaleDateString('en-US', {month: 'long'})
    .toUpperCase();

  const handleExport = async () => {
    toast.show('Preparing PDF…', toast.SHORT);
    const res = await exportMut.mutateAsync(undefined).catch(() => null);
    toast.show(
      res?.url
        ? 'PDF ready — opening'
        : res?.message ?? 'Report downloads aren’t available yet.',
      toast.LONG,
    );
  };

  return (
    <Screen
      title="Portfolio"
      back="Reports"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label={`Gross rent · ${monthLabel}`}
        badge={{text: `${portfolio.properties ?? byProperty.length} properties`}}
        amount={usd(performance?.grossRentIncome)}
        amountSize={34}
        sub={`${portfolio.occupancyRate ?? Math.round(performance?.occupancyRate ?? 0)}% occupied · ${
          portfolio.occupied ?? '—'
        } of ${portfolio.units ?? '—'} units`}
      />

      {/* 6-month collected — gold marks the current month (F5) */}
      {trend.length > 0 && (
        <View className="mt-5">
          <SectionLabel>6-month collected</SectionLabel>
          <Card>
            <View
              className="flex-row items-end"
              style={{height: 88, gap: 8}}>
              {trend.map((t, i) => (
                <View
                  key={t.label}
                  style={{
                    flex: 1,
                    height: `${barPct(t.collected)}%`,
                    borderRadius: 6,
                    backgroundColor:
                      i === trend.length - 1
                        ? COLORS.keystone_gold
                        : 'rgba(21,37,53,0.08)',
                  }}
                />
              ))}
            </View>
            <View className="flex-row mt-2" style={{gap: 8}}>
              {trend.map((t, i) => (
                <Text
                  key={t.label}
                  numberOfLines={1}
                  className={`flex-1 text-center font-inter text-xs ${
                    i === trend.length - 1
                      ? 'text-keystone_navy font-inter-semibold'
                      : 'text-keystone_slate'
                  }`}>
                  {t.label}
                </Text>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* By property — collection % as the health signal */}
      <View className="mt-5">
        <SectionLabel>By property</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {byProperty.map((p, i) => (
            <View
              key={p.id}
              className="flex-row items-center py-3.5"
              style={
                i < byProperty.length - 1 && {
                  borderBottomWidth: 0.5,
                  borderBottomColor: COLORS.keystone_hairline,
                }
              }>
              <View className="flex-1" style={{minWidth: 0}}>
                <Text
                  numberOfLines={1}
                  className="text-keystone_navy font-inter-semibold text-base">
                  {p.name}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-text_muted font-inter text-xs mt-0.5">
                  {p.units} units · {p.occupancy}% occupied
                </Text>
              </View>
              <View className="items-end" style={{flexShrink: 0}}>
                <Text
                  className="text-keystone_navy font-inter-bold text-base"
                  style={{fontVariant: ['tabular-nums']}}>
                  {usd(p.collected)}
                </Text>
                <Text
                  className="font-inter-semibold text-xs mt-0.5"
                  style={{color: rateColor(p.collectionRate)}}>
                  {p.collectionRate}% collected
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Income statement */}
      <View className="mt-5">
        <SectionLabel>Income statement</SectionLabel>
        <Card>
          <Row label="Gross rent income" value={usd(performance?.grossRentIncome)} />
          <Row
            label="Vacancy loss"
            value={
              performance?.vacancyLoss == null
                ? NO_VALUE
                : usd(-Math.abs(performance.vacancyLoss))
            }
            valueColor={COLORS.c_danger}
          />
          <Row
            label="Late fees"
            value={
              performance?.lateFees == null
                ? NO_VALUE
                : `+${usd(performance.lateFees)}`
            }
            valueColor={COLORS.c_success}
          />
          <Row
            label="Insurance claims"
            value={
              performance?.insuranceClaims == null
                ? NO_VALUE
                : usd(-Math.abs(performance.insuranceClaims))
            }
            valueColor={performance?.insuranceClaims ? COLORS.c_danger : undefined}
          />
          <Divider style={{marginVertical: 8}} />
          <Row label="Net collected" value={usd(performance?.netCollected)} bold />
        </Card>
      </View>

      {/* Deltas */}
      <View className="mt-4">
        <Card>
          <View className="flex-row items-center justify-between">
            <Text className="text-text_muted font-inter text-sm">vs last month</Text>
            <Delta value={performance?.vsLastMonth} />
          </View>
          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-text_muted font-inter text-sm">vs last year</Text>
            <Delta value={performance?.vsLastYear} />
          </View>
        </Card>
      </View>

      <View className="mt-5">
        {exportMut.isPending ? (
          <View style={{minHeight: 52, justifyContent: 'center'}}>
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        ) : (
          <PrimaryButton label="Export PDF" onPress={handleExport} />
        )}
      </View>

      {isPending && !performance && (
        <View className="items-center py-8">
          <ActivityIndicator color={COLORS.keystone_navy} />
        </View>
      )}
    </Screen>
  );
};

export default Portfolio;
