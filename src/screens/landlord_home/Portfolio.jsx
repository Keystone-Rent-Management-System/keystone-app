import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {usd, pct} from '../../utils/money';
import {useExportPortfolioPdf, usePortfolio} from '../../hooks/usePortfolio';

// Portfolio Performance — the screen that replaces the landlord's
// Excel-to-property-owner workflow. Clean fixed-width columns, a few
// deltas, single PDF export button.

const Portfolio = () => {
  const {performance, isPending, isRefetching, refetch} = usePortfolio();
  const exportMut = useExportPortfolioPdf();

  const handleExport = async () => {
    ToastAndroid.show('Preparing PDF…', ToastAndroid.SHORT);
    const res = await exportMut.mutateAsync(undefined).catch(() => null);
    if (res?.url) {
      // Hand-off to the share sheet. The SPA pattern is to open in a
      // webview; on mobile we let the OS handle the URL.
      ToastAndroid.show('PDF ready — opening', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show(
        res?.message ?? 'PDF export not available yet',
        ToastAndroid.LONG,
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-keystone_stone"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }>
      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <Text className="text-grey_1 font-inter text-xs uppercase tracking-widest">
          Portfolio Overview
        </Text>
        <Text className="text-keystone_navy font-inter-bold text-2xl mt-1">
          {performance?.period ?? 'Current period'}
        </Text>
      </View>

      {/* Income / loss table */}
      <View className="mx-4 bg-white rounded-2xl p-5 shadow-sm">
        <PerfRow
          label="Gross Rent Income"
          value={usd(performance?.grossRentIncome)}
        />
        <PerfRow
          label="Vacancy Loss"
          value={`-${usd(performance?.vacancyLoss ?? 0)}`}
          valueClass="text-[#EF4444]"
        />
        <PerfRow
          label="Late Fees"
          value={`+${usd(performance?.lateFees ?? 0)}`}
          valueClass="text-[#22C55E]"
        />
        <PerfRow
          label="Insurance Claims"
          value={`-${usd(performance?.insuranceClaims ?? 0)}`}
          valueClass={
            performance?.insuranceClaims
              ? 'text-[#EF4444]'
              : 'text-keystone_navy'
          }
        />
        <View className="h-px bg-keystone_cream my-3" />
        <PerfRow
          label="Net Collected"
          value={usd(performance?.netCollected)}
          bold
        />
      </View>

      {/* Health metrics */}
      <View className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-grey_1 font-inter text-xs uppercase tracking-wider mb-3">
          Health
        </Text>
        <PerfRow
          label="Occupancy Rate"
          value={pct(performance?.occupancyRate, {decimals: 1})}
        />
        <PerfRow
          label="Average Days to Pay"
          value={`${performance?.averageDaysToPay ?? '—'} days`}
        />
        <PerfRow
          label="On-Time Rate"
          value={pct(performance?.onTimeRate, {decimals: 1})}
        />
      </View>

      {/* Vs prior periods */}
      <View className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <DeltaRow label="vs Last Month" value={performance?.vsLastMonth} />
        <DeltaRow label="vs Last Year" value={performance?.vsLastYear} />
      </View>

      {/* PDF export */}
      <View className="px-4 mt-6 mb-12">
        <TouchableOpacity
          onPress={handleExport}
          disabled={exportMut.isPending}
          activeOpacity={0.85}
          className={`rounded-2xl p-4 items-center justify-center ${
            exportMut.isPending ? 'bg-keystone_navy/40' : 'bg-keystone_navy'
          }`}>
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
        <View className="absolute inset-0 items-center justify-center bg-white/60">
          <ActivityIndicator color="#152535" />
        </View>
      )}
    </ScrollView>
  );
};

const PerfRow = ({label, value, valueClass, bold}) => (
  <View className="flex-row items-center justify-between py-2">
    <Text
      className={`text-grey_1 font-inter text-sm ${
        bold ? 'text-keystone_navy font-inter-semibold' : ''
      }`}>
      {label}
    </Text>
    <Text
      className={`font-${bold ? 'inter-bold text-lg' : 'inter-semibold text-base'} ${
        valueClass ?? 'text-keystone_navy'
      }`}>
      {value}
    </Text>
  </View>
);

const DeltaRow = ({label, value}) => {
  const positive = (value ?? 0) >= 0;
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-grey_1 font-inter text-sm">{label}</Text>
      <Text
        className={`font-inter-semibold text-base ${
          positive ? 'text-[#22C55E]' : 'text-[#EF4444]'
        }`}>
        {positive ? '↑' : '↓'} {pct(Math.abs(value ?? 0), {decimals: 1})}
      </Text>
    </View>
  );
};

export default Portfolio;
