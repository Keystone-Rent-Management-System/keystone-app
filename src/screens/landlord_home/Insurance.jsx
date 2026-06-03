import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useInsurance} from '../../hooks/useInsurance';
import {usd, pct} from '../../utils/money';

// Rent insurance — the protection product. Zero active claims means
// it's working. The covered-rent number is the scale; the out-of-
// pocket number is the punchline.

const Insurance = () => {
  const {insurance, isPending, isRefetching, refetch} = useInsurance();

  return (
    <ScrollView
      className="flex-1 bg-keystone_stone"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }>
      <View className="px-5 pt-6 pb-4">
        <Text className="text-grey_1 font-inter text-xs uppercase tracking-widest">
          Rent Guarantee Coverage
        </Text>
      </View>

      {/* Coverage scale */}
      <View className="mx-4 bg-white rounded-2xl p-5 shadow-sm">
        <Row
          label="Insured Units"
          value={`${insurance?.insuredUnits ?? 0} / ${insurance?.totalUnits ?? 0}`}
          tag={pct(insurance?.coveragePercent ?? 0)}
        />
        <Row
          label="Monthly Premium"
          value={usd(insurance?.monthlyPremium ?? 0)}
          tag="collected"
        />
      </View>

      {/* Claims activity */}
      <View className="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-grey_1 font-inter text-xs uppercase tracking-wider mb-3">
          Claims
        </Text>
        <Row label="Active Claims" value={insurance?.activeClaims ?? 0} />
        <Row label="Claims This Year" value={insurance?.claimsYTD ?? 0} />
        <Row label="Total Paid Out" value={usd(insurance?.paidOutYTD ?? 0)} />
        <Row label="Recovered" value={usd(insurance?.recoveredYTD ?? 0)} />
      </View>

      {/* The headline numbers */}
      <View className="mx-4 mt-4 bg-keystone_navy rounded-2xl p-5">
        <Text className="text-keystone_cream font-inter text-xs uppercase tracking-widest">
          Your Net Protection
        </Text>
        <Text className="text-white font-inter-bold text-3xl mt-2">
          {usd(insurance?.netCoveredRent ?? 0)}
        </Text>
        <Text className="text-keystone_cream font-inter text-sm mt-1">
          covered rent
        </Text>
        <View className="h-px bg-keystone_cream/30 my-3" />
        <Text className="text-keystone_cream font-inter text-xs uppercase tracking-widest">
          Out of pocket
        </Text>
        <Text className="text-keystone_gold font-inter-bold text-2xl mt-1">
          {usd(insurance?.outOfPocket ?? 0)}
        </Text>
      </View>

      <View className="h-12" />
      {isPending && (
        <View className="absolute inset-0 items-center justify-center bg-white/60">
          <ActivityIndicator color="#152535" />
        </View>
      )}
    </ScrollView>
  );
};

const Row = ({label, value, tag}) => (
  <View className="flex-row items-center justify-between py-2">
    <Text className="text-grey_1 font-inter text-sm">{label}</Text>
    <View className="flex-row items-baseline gap-2">
      <Text className="text-keystone_navy font-inter-semibold text-base">
        {value}
      </Text>
      {tag && <Text className="text-grey_1 font-inter text-xs">{tag}</Text>}
    </View>
  </View>
);

export default Insurance;
