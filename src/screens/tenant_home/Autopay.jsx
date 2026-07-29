import React, {useEffect, useMemo, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Divider, Icon, IconChip} from '../../components/premium';
import {
  ConsentBlock,
  HeroCard,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
  SegmentedChoice,
  Timeline,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {ACH} from '../../constants/legalCopy';

// Autopay — expanded to the full decision (design 2e): day-of-month
// segment, source method, what-happens-next timeline (1g), failure
// policy in plain words, one primary CTA that restates the choice
// (K4). Turning ON still requires the explicit NACHA authorization —
// the CTA opens the mandate; the ConsentBlock is the L1–L3 spec.

const ordinal = n => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const Autopay = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const autopay = home?.autopay ?? {};
  const methods = home?.paymentMethods ?? [];
  const rent = home?.rent ?? {};

  const [enabled, setEnabled] = useState(autopay.enabled ?? false);
  const [day, setDay] = useState(autopay.dayOfMonth ?? 1);
  const [dayMode, setDayMode] = useState(
    (autopay.dayOfMonth ?? 1) === 1 ? '1' : autopay.dayOfMonth === 28 ? '28' : 'custom',
  );
  const [methodId, setMethodId] = useState(autopay.methodId ?? methods[0]?.id);
  const [pickingMethod, setPickingMethod] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    setEnabled(autopay.enabled ?? false);
    setMethodId(autopay.methodId ?? methods[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autopay.enabled, autopay.methodId]);

  const method = methods.find(m => m.id === methodId) ?? methods[0];
  const dayLabel = ordinal(day);
  const methodLabel = method ? `${method.name} ••${method.last4}` : 'your bank';

  const onDayMode = mode => {
    setDayMode(mode);
    if (mode === '1') setDay(1);
    if (mode === '28') setDay(28);
  };

  // Next occurrence of the chosen pay day, as "Aug 1" (2e: concrete
  // dates, and nothing has happened yet — first step is current, the
  // rest upcoming).
  const payDateLabel = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    if (d <= now) d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  }, [day]);

  const timelineSteps = useMemo(
    () => [
      {
        state: 'current',
        title: '3 days before — heads-up',
        sub: 'We remind you; skip any month with one tap.',
      },
      {
        state: 'upcoming',
        title: `${payDateLabel} — we pay ${usd(rent.amount)}`,
        sub: `Sent instantly from ${methodLabel}. Receipt in your inbox.`,
      },
      {
        state: 'upcoming',
        title: 'Same day — credit reported',
        sub: 'Counts toward your on-time streak.',
      },
    ],
    [payDateLabel, methodLabel, rent.amount],
  );

  const turnOff = () => {
    setEnabled(false);
    setAuthorizing(false);
    setAuthorized(false);
    ToastAndroid.show('Autopay off', ToastAndroid.SHORT);
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
    <Screen
      title="Autopay"
      back="Pay"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }
      stickyFooter={
        !authorizing ? (
          enabled ? (
            <SecondaryButton label="Turn off autopay" danger onPress={turnOff} />
          ) : (
            <PrimaryButton
              label={`Turn on autopay — ${dayLabel} of each month`}
              disabled={!method}
              onPress={() => setAuthorizing(true)}
            />
          )
        ) : null
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="Autopay"
        badge={{
          text: enabled ? 'On' : 'Off',
          dot: enabled ? 'success' : undefined,
        }}
        amount={enabled ? 'On' : 'Never think about rent again'}
        amountSize={enabled ? 34 : 24}
        sub={
          enabled
            ? `We pay ${usd(rent.amount)} on the ${dayLabel} of each month — automatically.`
            : 'We pay on the day you pick, and every payment builds your credit.'
        }
      />

      {/* PAY ON */}
      <View className="mt-5">
        <SectionLabel>Pay on</SectionLabel>
        <SegmentedChoice
          options={[
            {value: '1', label: '1st', sub: 'due date'},
            {value: '28', label: '28th', sub: '3 days early'},
            {value: 'custom', label: 'Custom', sub: 'pick a day'},
          ]}
          value={dayMode}
          onChange={onDayMode}
        />
        {dayMode === 'custom' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginTop: 10}}
            contentContainerStyle={{gap: 8}}>
            {Array.from({length: 28}, (_, i) => i + 1).map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setDay(d)}
                activeOpacity={0.8}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: day === d ? COLORS.keystone_navy : '#FFFFFF',
                  borderWidth: 1,
                  borderColor:
                    day === d ? COLORS.keystone_navy : 'rgba(21,37,53,0.16)',
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 15,
                    color: day === d ? COLORS.keystone_cream : COLORS.keystone_navy,
                    fontVariant: ['tabular-nums'],
                  }}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {/* PAY FROM */}
      <View className="mt-5">
        <SectionLabel>Pay from</SectionLabel>
        <Card style={{paddingVertical: 6, paddingHorizontal: 16}}>
          {methods.length === 0 ? (
            <Text className="text-text_muted font-inter text-sm text-center py-3">
              Add a payment method first to enable autopay.
            </Text>
          ) : pickingMethod ? (
            methods.map((m, i) => {
              const on = m.id === methodId;
              return (
                <View key={m.id}>
                  {i > 0 && <Divider />}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setMethodId(m.id);
                      setPickingMethod(false);
                    }}
                    className="flex-row items-center py-3.5">
                    <IconChip size={38}>
                      <Icon
                        name={m.type === 'bank' ? 'bank' : 'card'}
                        size={17}
                        color={COLORS.keystone_gold}
                      />
                    </IconChip>
                    <View className="flex-1 ml-3">
                      <Text className="text-keystone_navy font-inter-semibold text-sm">
                        {m.name} ••{m.last4}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs mt-0.5">
                        {m.type === 'bank'
                          ? 'Bank account · instant · $0 fee'
                          : 'Debit card'}
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
            })
          ) : (
            <View className="flex-row items-center py-3.5">
              <IconChip size={38}>
                <Icon
                  name={method?.type === 'bank' ? 'bank' : 'card'}
                  size={17}
                  color={COLORS.keystone_gold}
                />
              </IconChip>
              <View className="flex-1 ml-3" style={{minWidth: 0}}>
                <Text
                  numberOfLines={1}
                  className="text-keystone_navy font-inter-semibold text-sm">
                  {methodLabel}
                </Text>
                <Text className="text-text_muted font-inter text-xs mt-0.5">
                  {method?.type === 'bank'
                    ? 'Bank account · instant · $0 fee'
                    : 'Debit card'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPickingMethod(true)}>
                <Text className="text-keystone_gold font-inter-semibold text-sm">
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </View>

      {/* WHAT HAPPENS NEXT */}
      <View className="mt-5">
        <SectionLabel>What happens next</SectionLabel>
        <Card>
          <Timeline steps={timelineSteps} />
        </Card>
        <Text className="text-keystone_slate font-inter text-xs mt-3 ml-1 leading-5">
          If a payment can't be made, we never retry silently — you get a push,
          email, and 3 days to fix it before rent is late.
        </Text>
      </View>

      {/* ACH authorization (NACHA) — required before autopay turns on */}
      {authorizing && !enabled && (
        <View className="mt-5">
          <ConsentBlock
            copy={ACH.autopayMandate(usd(rent.amount), dayLabel, methodLabel)}
            checked={authorized}
            onToggle={() => setAuthorized(a => !a)}
            agreeText={ACH.autopayCheckbox}>
            <View className="flex-row gap-3 mt-4">
              <SecondaryButton
                label="Cancel"
                style={{flex: 1}}
                onPress={() => {
                  setAuthorizing(false);
                  setAuthorized(false);
                }}
              />
              <PrimaryButton
                label={ACH.autopayConfirmCta}
                style={{flex: 1}}
                disabled={!authorized}
                onPress={confirmAuthorize}
              />
            </View>
          </ConsentBlock>
        </View>
      )}
    </Screen>
  );
};

export default Autopay;
