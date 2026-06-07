import React, {useEffect, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, Label, Divider, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Autopay — set it and never think about rent again. PATCH /tenants/autopay.

const Autopay = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const autopay = home?.autopay ?? {};
  const methods = home?.paymentMethods ?? [];
  const rent = home?.rent ?? {};

  const [enabled, setEnabled] = useState(autopay.enabled ?? false);
  const [methodId, setMethodId] = useState(autopay.methodId ?? methods[0]?.id);

  // Sync local toggle state once the shared query resolves — useState only
  // captures the value at mount, so a direct entry (deep-link straight to
  // Autopay) would otherwise show stale defaults until the user touches it.
  useEffect(() => {
    setEnabled(autopay.enabled ?? false);
    setMethodId(autopay.methodId ?? methods[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autopay.enabled, autopay.methodId]);

  const method = methods.find(m => m.id === methodId) ?? methods[0];

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>Autopay</Label>
            <Text className="text-white font-inter-bold text-2xl mt-2">
              {enabled ? 'On' : 'Off'}
            </Text>
            <Text className="text-white/60 font-inter text-sm mt-1">
              {enabled
                ? `We’ll pay ${usd(rent.amount)} on the 1st of each month — automatically.`
                : 'Turn on autopay so rent is never late and your credit keeps growing.'}
            </Text>
          </Card>
        </View>

        {/* Toggle */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <IconChip>
                  <Icon name="shield" size={19} color={COLORS.keystone_gold} />
                </IconChip>
                <Text className="text-keystone_navy font-inter-semibold text-sm flex-1">
                  Pay rent automatically
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={v => {
                  setEnabled(v);
                  ToastAndroid.show(v ? 'Autopay on' : 'Autopay off', ToastAndroid.SHORT);
                }}
                trackColor={{true: COLORS.keystone_gold, false: '#CBD2D9'}}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </View>

        {/* Method picker */}
        {enabled && (
          <View className="px-4 mt-4">
            <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
              Pay from
            </Text>
            <Card style={{paddingVertical: 6}}>
              {methods.length === 0 && (
                <Text className="text-text_muted font-inter text-sm text-center py-3">
                  Add a payment method first to enable autopay.
                </Text>
              )}
              {methods.map((m, i) => {
                const on = m.id === methodId;
                return (
                  <View key={m.id}>
                    {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setMethodId(m.id)}
                      className="flex-row items-center px-3 py-3.5">
                      <IconChip size={38}>
                        <Icon name={m.type === 'bank' ? 'bank' : 'card'} size={17} color={COLORS.keystone_gold} />
                      </IconChip>
                      <View className="flex-1 ml-3">
                        <Text className="text-keystone_navy font-inter-semibold text-sm">
                          {m.name} ••{m.last4}
                        </Text>
                        <Text className="text-text_muted font-inter text-xs mt-0.5">
                          {m.type === 'bank' ? 'Bank account' : 'Debit card'}
                        </Text>
                      </View>
                      <View
                        className="w-5 h-5 rounded-full items-center justify-center"
                        style={{
                          borderWidth: 2,
                          borderColor: on ? COLORS.keystone_gold : '#CBD2D9',
                          backgroundColor: on ? COLORS.keystone_gold : 'transparent',
                        }}>
                        {on && <Text className="text-white text-2xs">✓</Text>}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </Card>
            <Text className="text-text_muted font-inter text-xs mt-3 ml-1">
              We’ll pay from {method?.name} ••{method?.last4} on the 1st. You can
              turn this off anytime.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Autopay;
