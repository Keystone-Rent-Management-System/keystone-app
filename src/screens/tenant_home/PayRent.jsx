import React, {useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Divider, Row, Icon, IconChip} from '../../components/premium';
import {
  ConsentBlock,
  HeroCard,
  PrimaryButton,
  Screen,
  SectionLabel,
  eventDate,
  periodLabel,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {ACH} from '../../constants/legalCopy';

// Pay rent — checkout (design 5a; quality bar, structure kept 1:1).
// Fixes only: full authorization copy above the fold (no clipping
// under the sticky bar), CTA on an opaque S4 strip, hero label
// follows D1 ("YOU'RE PAYING · JULY RENT" / "Due Aug 1 · paying
// today"), ONE-TIME chip states scope. The redundant grey strip above
// the CTA is gone — it duplicated the consent card.

const PayRent = () => {
  const nav = useNavigation();
  const {home} = useTenantHome();
  const [paying, setPaying] = useState(false);

  const rent = home?.rent ?? {};
  const method = home?.paymentMethod ?? {};
  const lease = home?.lease ?? {};
  const amount = rent.amount ?? 0;

  const onPay = () => {
    setPaying(true);
    ToastAndroid.show('Sending your rent…', ToastAndroid.SHORT);
    // The BE settlement call lands here. Build the receipt the screen
    // navigates to from its (eventual) response.
    const code = `KS-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    nav.replace('rent_receipt', {
      amount,
      method: method.name ? `${method.name} ••${method.last4}` : 'Your bank',
      date: new Date().toISOString(),
      code,
      period: rent.periodLabel,
      landlord: lease.landlord,
      property: lease.property,
      unit: lease.unit,
    });
  };

  return (
    <Screen
      title="Pay rent"
      back="Pay"
      stickyFooter={
        paying ? (
          <View style={{minHeight: 52, justifyContent: 'center'}}>
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        ) : (
          <PrimaryButton
            label={`Pay ${usd(amount)} now`}
            disabled={amount <= 0}
            onPress={onPay}
          />
        )
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text className="text-keystone_slate font-inter text-[15px] mb-4">
        Goes straight to {lease.landlord ?? 'your landlord'} — instantly.
      </Text>

      <HeroCard
        label={`YOU'RE PAYING · ${periodLabel(rent.dueDate ?? new Date())}`}
        badge={{text: 'One-time'}}
        amount={usd(amount)}
        sub={`${eventDate('Due', rent.dueDate)} · paying today`}
      />

      <View className="mt-5">
        <SectionLabel>Paying from</SectionLabel>
        <Card>
          <View className="flex-row items-center">
            <IconChip>
              <Icon name="bank" size={20} color={COLORS.keystone_gold} />
            </IconChip>
            <View className="flex-1 ml-3" style={{minWidth: 0}}>
              <Text
                numberOfLines={1}
                className="text-keystone_navy font-inter-semibold text-base">
                {method.name ?? 'Your bank'}
                {method.last4 ? ` ••${method.last4}` : ''}
              </Text>
              <Text className="text-text_muted font-inter text-xs mt-0.5">
                Bank account · instant transfer
              </Text>
            </View>
            <TouchableOpacity onPress={() => nav.navigate('payment_methods')}>
              <Text className="text-keystone_gold font-inter-semibold text-sm">
                Change
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      <View className="mt-5">
        <Card>
          <Row label="Rent" value={usd(amount)} />
          <Divider />
          <Row label="Service fee" value="$0" valueColor={COLORS.c_success} />
          <Divider />
          <Row label="Total" value={usd(amount)} bold />
        </Card>
        <Text className="text-keystone_slate font-inter text-xs mt-3 ml-1">
          No fees to you. Keystone settles the transfer directly to your
          landlord's bank.
        </Text>
      </View>

      {/* ACH authorization (NACHA) + Reg E — full copy, above the fold */}
      <View className="mt-5">
        <ConsentBlock
          copy={ACH.oneTimeMandate(
            usd(amount),
            method.name ? `${method.name} ••${method.last4}` : 'your bank',
            rent.periodLabel ?? 'this period',
          )}>
          <Divider style={{marginVertical: 10}} />
          <Text className="text-text_muted font-inter text-xs leading-5">
            {ACH.regE}
          </Text>
        </ConsentBlock>
      </View>
    </Screen>
  );
};

export default PayRent;
