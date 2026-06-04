import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {useInsurance} from '../../hooks/useInsurance';
import {usd, pct} from '../../utils/money';
import {Card, IconChip, Label, Amount, AnimatedAmount, Divider, Row, ProgressBar, Stat, Icon} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Rent insurance — the protection product. Zero active claims means
// it's working; covered-rent is the scale; out-of-pocket is the
// punchline (the navy feature hero).

const Insurance = () => {
  const {insurance, isPending, isRefetching, refetch} = useInsurance();

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        <View className="px-5 pt-6 pb-4">
          <Text className="text-keystone_navy font-inter-bold text-2xl">Rent Insurance</Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Rent guarantee coverage across your portfolio
          </Text>
        </View>

        {/* Net protection hero */}
        <View className="px-4">
          <Card feature>
            <Label onDark>Your net protection</Label>
            <AnimatedAmount
              value={insurance?.netCoveredRent ?? 0}
              format={usd}
              size="xl"
              onDark
              style={{marginTop: 10}}
            />
            <Text className="text-white/55 font-inter text-xs mt-1">covered rent</Text>
            <Divider onDark style={{marginVertical: 14}} />
            <View className="flex-row items-center justify-between">
              <Label onDark>Out of pocket</Label>
              <Text className="text-keystone_gold font-inter-bold text-2xl">
                {usd(insurance?.outOfPocket ?? 0)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Coverage */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center gap-3 mb-3">
              <IconChip><Icon name="shield" size={19} /></IconChip>
              <Label>Coverage</Label>
            </View>
            <View className="flex-row items-end justify-between">
              <Amount size="lg">
                {insurance?.insuredUnits ?? 0}
                <Text className="text-text_muted font-inter text-base"> / {insurance?.totalUnits ?? 0} units</Text>
              </Amount>
              <View className="bg-keystone_chip rounded-full px-3 py-1">
                <Text className="text-keystone_gold font-inter-bold text-sm">
                  {pct(insurance?.coveragePercent ?? 0)}
                </Text>
              </View>
            </View>
            <ProgressBar percent={insurance?.coveragePercent ?? 0} style={{marginTop: 12}} />
            <Divider style={{marginVertical: 14}} />
            <Row label="Monthly premium collected" value={usd(insurance?.monthlyPremium ?? 0)} />
          </Card>
        </View>

        {/* Claims */}
        <View className="px-4 mt-4">
          <Card>
            <Label>Claims</Label>
            <View className="flex-row mt-3">
              <Stat label="Active" value={`${insurance?.activeClaims ?? 0}`} valueColor={(insurance?.activeClaims ?? 0) > 0 ? COLORS.c_danger : COLORS.c_success} />
              <View className="w-px bg-keystone_hairline" />
              <Stat label="This year" value={`${insurance?.claimsYTD ?? 0}`} align="left" style={{paddingLeft: 14}} />
              <View className="w-px bg-keystone_hairline" />
              <Stat label="Paid out" value={usd(insurance?.paidOutYTD ?? 0)} align="left" style={{paddingLeft: 14}} />
              <View className="w-px bg-keystone_hairline" />
              <Stat label="Recovered" value={usd(insurance?.recoveredYTD ?? 0)} align="right" />
            </View>
          </Card>
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

export default Insurance;
