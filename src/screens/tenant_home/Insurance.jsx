import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import {useTenantInsurance} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, Label, Divider, Row, StatusPill, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Renters insurance — often lease-required, and a natural cross-sell next
// to the landlord's rent insurance. Show coverage, or offer to get covered.

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
};

const Insurance = () => {
  const {insurance, isPending, isRefetching, refetch} = useTenantInsurance();
  const covered = insurance?.status === 'COVERED';

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Status hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <View className="flex-row items-center justify-between">
              <Label onDark>Renters insurance</Label>
              <StatusPill
                label={covered ? 'Covered' : 'Not covered'}
                tone={covered ? 'success' : 'danger'}
              />
            </View>
            <Text className="text-white font-inter-bold text-2xl mt-3">
              {covered ? insurance?.provider : 'Protect your stuff'}
            </Text>
            <Text className="text-white/55 font-inter text-xs mt-1">
              {covered
                ? `Policy ${insurance?.policyNumber} · renews ${fmtDate(insurance?.renewsOn)}`
                : 'Coverage from $14/mo — and it satisfies your lease.'}
            </Text>
          </Card>
        </View>

        {covered ? (
          <View className="px-4 mt-4">
            <Card>
              <Row label="Personal property" value={usd(insurance?.personalProperty)} />
              <Divider />
              <Row label="Liability" value={usd(insurance?.liability)} />
              <Divider />
              <Row label="Deductible" value={usd(insurance?.deductible)} />
              <Divider />
              <Row label="Premium" value={`${usd(insurance?.monthlyPremium)}/mo`} />
            </Card>
            <TouchableOpacity
              onPress={() => ToastAndroid.show('File a claim — coming soon', ToastAndroid.SHORT)}
              activeOpacity={0.85}
              className="mt-4 border border-keystone_navy rounded-2xl py-4 items-center">
              <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wider">
                File a claim
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-4 mt-4">
            <Card>
              <View className="flex-row items-center gap-3">
                <IconChip>
                  <Icon name="shield" size={19} color={COLORS.keystone_gold} />
                </IconChip>
                <Text className="text-keystone_navy font-inter-semibold text-sm flex-1">
                  What it covers
                </Text>
              </View>
              <Divider style={{marginVertical: 12}} />
              {['Your belongings if they’re stolen or damaged', 'Liability if someone’s hurt in your unit', 'Temporary housing if your place is unlivable'].map(t => (
                <View key={t} className="flex-row items-start py-1.5">
                  <Text className="text-c_success font-inter-semibold mr-2">✓</Text>
                  <Text className="text-keystone_navy font-inter text-sm flex-1">{t}</Text>
                </View>
              ))}
            </Card>
            <TouchableOpacity
              onPress={() => ToastAndroid.show('Get covered — coming soon', ToastAndroid.SHORT)}
              activeOpacity={0.9}
              className="mt-4 bg-keystone_navy rounded-2xl py-4 items-center">
              <Text className="text-white font-inter-bold text-base">Get covered — $14/mo</Text>
            </TouchableOpacity>
          </View>
        )}

        {isPending && (
          <Text className="text-text_muted font-inter text-sm ml-5 mt-4">Loading…</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Insurance;
