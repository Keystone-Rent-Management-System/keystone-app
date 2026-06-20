import React, {useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, Label, Amount, Divider, Row, Icon, IconChip, DraftBadge} from '../../components/premium';
import COLORS from '../../constants/Theme';
import {ACH} from '../../constants/legalCopy';

// Pay rent — instant + direct. Keystone moves the rent straight into
// the landlord's bank the moment the tenant taps; there's no paybill,
// no escrow, and no fee to the tenant. (Replaces the old Mpesa-prompt
// stub.) Real settlement endpoint is a BE ask; here the confirm builds
// the receipt the same way the BE response will.

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
      method: method.name
        ? `${method.name} ••${method.last4}`
        : 'Your bank',
      date: new Date().toISOString(),
      code,
      period: rent.periodLabel,
      landlord: lease.landlord,
      property: lease.property,
      unit: lease.unit,
    });
  };

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-6 pb-3">
          <Text className="text-keystone_navy font-inter-bold text-2xl">
            Pay rent
          </Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Goes straight to {lease.landlord ?? 'your landlord'} — instantly.
          </Text>
        </View>

        {/* Amount hero */}
        <View className="px-4">
          <Card feature>
            <Label onDark>You’re paying · {rent.periodLabel ?? ''}</Label>
            <Amount size="xl" onDark style={{marginTop: 10}}>
              {usd(amount)}
            </Amount>
            <Text className="text-white/55 font-inter text-xs mt-2">
              {lease.property}
              {lease.unit ? ` · ${lease.unit}` : ''}
            </Text>
          </Card>
        </View>

        {/* Payment source */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Paying from
          </Text>
          <Card>
            <View className="flex-row items-center">
              <IconChip>
                <Icon name="bank" size={20} color={COLORS.keystone_gold} />
              </IconChip>
              <View className="flex-1 ml-3">
                <Text className="text-keystone_navy font-inter-semibold text-base">
                  {method.name ?? 'Your bank'}
                  {method.last4 ? ` ••${method.last4}` : ''}
                </Text>
                <Text className="text-text_muted font-inter text-xs mt-0.5">
                  Bank account · instant transfer
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  ToastAndroid.show('Manage payment methods — coming soon', ToastAndroid.SHORT)
                }>
                <Text className="text-gold_text font-inter-semibold text-xs">
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Breakdown */}
        <View className="px-4 mt-5">
          <Card>
            <Row label="Rent" value={usd(amount)} />
            <Divider />
            <Row label="Service fee" value="$0" valueColor={COLORS.c_success} />
            <Divider />
            <Row label="Total" value={usd(amount)} bold />
          </Card>
          <Text className="text-text_muted font-inter text-xs mt-3 ml-1">
            No fees to you. Keystone settles the transfer directly to your
            landlord’s bank.
          </Text>
        </View>

        {/* ACH authorization (NACHA) + Reg E notice */}
        <View className="px-4 mt-5">
          <Card>
            <DraftBadge />
            <Text className="text-text_muted font-inter text-xs leading-5">
              {ACH.oneTimeMandate(
                usd(amount),
                method.name ? `${method.name} ••${method.last4}` : 'your bank',
                rent.periodLabel ?? 'this period',
              )}
            </Text>
            <Divider style={{marginVertical: 10}} />
            <Text className="text-text_muted font-inter text-xs leading-5">
              {ACH.regE}
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Pay CTA */}
      <View className="px-4 pb-6 pt-2 bg-keystone_canvas">
        <Text className="text-text_muted font-inter text-2xs leading-4 mb-2 text-center px-2">
          By tapping Pay you authorize this one-time debit. See the
          authorization above.
        </Text>
        <TouchableOpacity
          onPress={onPay}
          disabled={paying || amount <= 0}
          activeOpacity={0.9}
          className="bg-keystone_navy rounded-2xl py-4 items-center">
          {paying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-inter-bold text-base">
              Pay {usd(amount)} now
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PayRent;
