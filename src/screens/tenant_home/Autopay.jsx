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
import {
  Card,
  Label,
  Divider,
  Icon,
  IconChip,
  DraftBadge,
  ConsentRow,
} from '../../components/premium';
import COLORS from '../../constants/Theme';
import {ACH} from '../../constants/legalCopy';

const ordinal = n => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Autopay — set it and never think about rent again. Because this is a
// recurring ACH debit (Dwolla white-label), turning it ON requires an
// explicit NACHA authorization: the tenant must see the mandate (amount, the
// day of the month, how to cancel) and affirmatively authorize before we
// enable it. PATCH /tenants/autopay stores { enabled, dayOfMonth, methodId,
// authorizationAt } — the timestamp is the authorization record.

const Autopay = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const autopay = home?.autopay ?? {};
  const methods = home?.paymentMethods ?? [];
  const rent = home?.rent ?? {};

  const [enabled, setEnabled] = useState(autopay.enabled ?? false);
  const [methodId, setMethodId] = useState(autopay.methodId ?? methods[0]?.id);
  // Authorization step shown when the tenant asks to turn autopay on.
  const [authorizing, setAuthorizing] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  // Sync local toggle state once the shared query resolves — useState only
  // captures the value at mount, so a direct entry (deep-link straight to
  // Autopay) would otherwise show stale defaults until the user touches it.
  useEffect(() => {
    setEnabled(autopay.enabled ?? false);
    setMethodId(autopay.methodId ?? methods[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autopay.enabled, autopay.methodId]);

  const method = methods.find(m => m.id === methodId) ?? methods[0];
  const dayLabel = ordinal(autopay.dayOfMonth ?? 1);
  const methodLabel = method ? `${method.name} ••${method.last4}` : 'your bank';

  const requestEnable = v => {
    if (v) {
      // Don't enable yet — gather the ACH authorization first.
      setAuthorizing(true);
    } else {
      setEnabled(false);
      setAuthorizing(false);
      setAuthorized(false);
      ToastAndroid.show('Autopay off', ToastAndroid.SHORT);
    }
  };

  const confirmAuthorize = () => {
    if (!authorized) {
      ToastAndroid.show('Please authorize the recurring payment', ToastAndroid.SHORT);
      return;
    }
    setEnabled(true);
    setAuthorizing(false);
    ToastAndroid.show('Autopay on', ToastAndroid.SHORT);
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
        {/* Hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>Autopay</Label>
            <Text className="text-white font-inter-bold text-2xl mt-2">
              {enabled ? 'On' : 'Off'}
            </Text>
            <Text className="text-white/60 font-inter text-sm mt-1">
              {enabled
                ? `We’ll pay ${usd(rent.amount)} on the ${dayLabel} of each month — automatically.`
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
              {/* Reflects the ACTUAL enabled state only — never shows ON
                  while the authorization is merely pending, so a screenshot
                  can't imply consent that wasn't given. The mandate panel
                  below is the pending-action indicator. */}
              <Switch
                value={enabled}
                onValueChange={requestEnable}
                trackColor={{true: COLORS.keystone_gold, false: '#CBD2D9'}}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </View>

        {/* ACH authorization (NACHA) — required before autopay turns on */}
        {authorizing && !enabled && (
          <View className="px-4 mt-4">
            <Card style={{borderColor: COLORS.keystone_gold, borderWidth: 1}}>
              <Label>Authorize recurring payment</Label>
              <View className="mt-2">
                <DraftBadge />
              </View>
              <Text className="text-text_muted font-inter text-xs leading-5">
                {ACH.autopayMandate(usd(rent.amount), dayLabel, methodLabel)}
              </Text>
              <ConsentRow checked={authorized} onToggle={() => setAuthorized(a => !a)}>
                {ACH.autopayCheckbox}
              </ConsentRow>
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    setAuthorizing(false);
                    setAuthorized(false);
                  }}
                  activeOpacity={0.85}
                  className="flex-1 border border-keystone_navy rounded-2xl py-3.5 items-center">
                  <Text className="text-keystone_navy font-inter-semibold text-sm">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmAuthorize}
                  disabled={!authorized}
                  activeOpacity={0.9}
                  style={{opacity: authorized ? 1 : 0.5}}
                  className="flex-1 bg-keystone_navy rounded-2xl py-3.5 items-center">
                  <Text className="text-white font-inter-semibold text-sm">
                    {ACH.autopayConfirmCta}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

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
