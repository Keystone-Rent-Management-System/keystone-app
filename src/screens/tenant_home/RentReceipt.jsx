import React from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {usd} from '../../utils/money';
import {Card, Label, Amount, Divider, Row} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Rent receipt — the calm confirmation after an instant payment.
// Reads what the pay flow passed (the BE settlement response will carry
// the same fields). Replaces the old hardcoded Mpesa receipt.

const fmtDateTime = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const RentReceipt = () => {
  const nav = useNavigation();
  const {params = {}} = useRoute();
  const {
    amount = 0,
    method = 'Your bank',
    date,
    code = '—',
    period,
    landlord,
    property,
    unit,
  } = params;

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}>
        {/* Success */}
        <View className="items-center pt-10 pb-2 px-6">
          <View
            style={{backgroundColor: 'rgba(5,166,96,0.12)'}}
            className="w-16 h-16 rounded-full items-center justify-center">
            <Text style={{color: COLORS.c_success, fontSize: 30}}>✓</Text>
          </View>
          <Text className="text-keystone_navy font-inter-bold text-2xl mt-4">
            Rent paid
          </Text>
          <Text className="text-text_muted font-inter text-sm mt-1 text-center">
            Sent instantly to {landlord ?? 'your landlord'}. You’re all set
            {period ? ` for ${period}` : ''}.
          </Text>
        </View>

        {/* Amount */}
        <View className="px-4 mt-4">
          <Card feature>
            <Label onDark>Amount paid</Label>
            <Amount size="xl" onDark style={{marginTop: 10}}>
              {usd(amount)}
            </Amount>
            <Text className="text-white/55 font-inter text-xs mt-2">
              Confirmation {code}
            </Text>
          </Card>
        </View>

        {/* Details */}
        <View className="px-4 mt-5">
          <Card>
            <Row label="Paid to" value={landlord ?? '—'} />
            <Divider />
            <Row
              label="Property"
              value={`${property ?? ''}${unit ? ` · ${unit}` : ''}`}
            />
            <Divider />
            <Row label="Paid from" value={method} />
            <Divider />
            <Row label="Date" value={fmtDateTime(date)} />
            <Divider />
            <Row label="Confirmation" value={code} />
          </Card>
        </View>

        {/* Actions */}
        <View className="px-4 mt-5 flex-row gap-3">
          <TouchableOpacity
            onPress={() =>
              ToastAndroid.show('Receipt saved to your device', ToastAndroid.SHORT)
            }
            activeOpacity={0.85}
            className="flex-1 border border-keystone_navy rounded-2xl p-4 items-center">
            <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wider">
              Save PDF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => nav.navigate('home')}
            activeOpacity={0.85}
            className="flex-1 bg-keystone_navy rounded-2xl p-4 items-center">
            <Text className="text-white font-inter-semibold text-sm uppercase tracking-wider">
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default RentReceipt;
