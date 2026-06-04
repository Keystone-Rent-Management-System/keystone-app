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
import {usd, pct} from '../../utils/money';
import {useExportPortfolioPdf, usePortfolio} from '../../hooks/usePortfolio';
import {Card, IconChip, Label, Amount, Divider, Row, Delta, Stat} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Portfolio Performance — the screen that replaces the landlord's
// Excel-to-owner workflow. Hero net-collected number, an income
// statement, health metrics, period deltas, one-tap PDF.

const Portfolio = () => {
  const {performance, isPending, isRefetching, refetch} = usePortfolio();
  const exportMut = useExportPortfolioPdf();

  const handleExport = async () => {
    ToastAndroid.show('Preparing PDF…', ToastAndroid.SHORT);
    const res = await exportMut.mutateAsync(undefined).catch(() => null);
    ToastAndroid.show(
      res?.url ? 'PDF ready — opening' : res?.message ?? 'PDF export coming soon',
      ToastAndroid.LONG,
    );
  };

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Hero net collected (navy feature) */}
        <View className="px-4 pt-4">
          <Card feature>
            <View className="flex-row items-center justify-between">
              <Label onDark>Net Collected · {performance?.period ?? 'This period'}</Label>
              {performance?.vsLastMonth != null && <Delta value={performance.vsLastMonth} />}
            </View>
            <Amount size="xl" onDark style={{marginTop: 12}}>
              {usd(performance?.netCollected)}
            </Amount>
            <View className="flex-row mt-4">
              <Stat label="Occupancy" value={pct(performance?.occupancyRate, {decimals: 1})} onDark />
              <View className="w-px bg-white/12" />
              <Stat label="On-time" value={pct(performance?.onTimeRate, {decimals: 1})} onDark align="left" style={{paddingLeft: 14}} />
              <View className="w-px bg-white/12" />
              <Stat label="Avg days to pay" value={`${performance?.averageDaysToPay ?? '—'}`} onDark align="right" />
            </View>
          </Card>
        </View>

        {/* Income statement */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center gap-3 mb-2">
              <IconChip><Text style={{fontSize: 15}}>📈</Text></IconChip>
              <Label>Income statement</Label>
            </View>
            <Row label="Gross Rent Income" value={usd(performance?.grossRentIncome)} />
            <Row label="Vacancy Loss" value={`-${usd(performance?.vacancyLoss ?? 0)}`} valueColor={COLORS.c_danger} />
            <Row label="Late Fees" value={`+${usd(performance?.lateFees ?? 0)}`} valueColor={COLORS.c_success} />
            <Row
              label="Insurance Claims"
              value={`-${usd(performance?.insuranceClaims ?? 0)}`}
              valueColor={performance?.insuranceClaims ? COLORS.c_danger : undefined}
            />
            <Divider style={{marginVertical: 8}} />
            <Row label="Net Collected" value={usd(performance?.netCollected)} bold />
          </Card>
        </View>

        {/* Trend */}
        <View className="px-4 mt-4">
          <Card>
            <Label>Performance</Label>
            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-text_muted font-inter text-sm">vs Last Month</Text>
              <Delta value={performance?.vsLastMonth} />
            </View>
            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-text_muted font-inter text-sm">vs Last Year</Text>
              <Delta value={performance?.vsLastYear} />
            </View>
          </Card>
        </View>

        {/* PDF export */}
        <View className="px-4 mt-5">
          <TouchableOpacity
            onPress={handleExport}
            disabled={exportMut.isPending}
            activeOpacity={0.85}
            className="bg-keystone_navy rounded-2xl p-4 items-center">
            {exportMut.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-inter-semibold text-base uppercase tracking-wider">
                Export PDF
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {isPending && (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Portfolio;
