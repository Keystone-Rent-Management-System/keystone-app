import React, {useEffect, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  ToastAndroid,
  View,
} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Label, Divider, Icon, IconChip, Ring, Sparkline} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Credit building — the reason a renter chooses to pay through Keystone.
// Every on-time rent payment is reported to the bureaus and builds their
// score. Score 300–850 mapped onto the Ring (0–100%).

const scoreToPct = s => Math.max(0, Math.min(100, Math.round(((s - 300) / 550) * 100)));

const Credit = () => {
  const {home, isPending, isRefetching, refetch} = useTenantHome();
  const credit = home?.credit ?? {};
  const [enabled, setEnabled] = useState(credit.enabled ?? true);

  // Reflect server state once the shared query resolves (useState only
  // captures the mount-time value).
  useEffect(() => {
    setEnabled(credit.enabled ?? true);
  }, [credit.enabled]);

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Score hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>Your credit · {credit.band ?? '—'}</Label>
            <View className="flex-row items-center mt-3">
              <Ring
                percent={scoreToPct(credit.score ?? 300)}
                size={120}
                thickness={11}
                color={COLORS.keystone_gold}
                trackColor="rgba(255,255,255,0.14)"
                centerValue={credit.score ?? '—'}
                centerLabel="score"
                centerColor="#FFFFFF"
              />
              <View className="flex-1 ml-4">
                <Text className="text-c_success font-inter-bold text-lg">
                  ▲ {credit.delta ?? 0} pts
                </Text>
                <Text className="text-white/60 font-inter text-xs mt-0.5">
                  since you joined Keystone
                </Text>
                <Text className="text-white font-inter-semibold text-sm mt-3">
                  {credit.streakMonths ?? 0} months on time
                </Text>
                <Text className="text-white/55 font-inter text-xs mt-0.5">
                  every payment counts
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Streak */}
        {credit.history?.length > 1 && (
          <View className="px-4 mt-4">
            <Card>
              <View className="flex-row items-center justify-between mb-3">
                <Label>Your score trend</Label>
                <Text className="text-text_muted font-inter text-xs">
                  last {credit.history.length} months
                </Text>
              </View>
              <View className="items-center">
                <Sparkline
                  data={credit.history}
                  width={300}
                  height={56}
                  lastColor={COLORS.keystone_gold}
                />
              </View>
            </Card>
          </View>
        )}

        {/* What we report */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <IconChip>
                  <Icon name="trending" size={19} color={COLORS.keystone_gold} />
                </IconChip>
                <View className="flex-1">
                  <Text className="text-keystone_navy font-inter-semibold text-sm">
                    Report my rent
                  </Text>
                  <Text className="text-text_muted font-inter text-xs mt-0.5">
                    On-time payments reported to {(credit.reportedTo ?? []).join(' & ')}
                  </Text>
                </View>
              </View>
              <Switch
                value={enabled}
                onValueChange={v => {
                  setEnabled(v);
                  ToastAndroid.show(
                    v ? 'Rent reporting on' : 'Rent reporting paused',
                    ToastAndroid.SHORT,
                  );
                }}
                trackColor={{true: COLORS.keystone_gold, false: '#CBD2D9'}}
                thumbColor="#FFFFFF"
              />
            </View>
            <Divider style={{marginVertical: 12}} />
            <Text className="text-text_muted font-inter text-xs leading-5">
              Rent is most people’s biggest monthly payment — but it usually
              builds nothing. Keystone reports every on-time rent payment to the
              credit bureaus, so paying your rent grows your credit. No extra
              steps, no fees.
            </Text>
          </Card>
        </View>

        {isPending && (
          <View className="px-4 mt-4">
            <Text className="text-text_muted font-inter text-sm ml-1">Loading…</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Credit;
