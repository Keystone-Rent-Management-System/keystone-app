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

import {useTenantPayments} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, IconChip, Label, Divider, Icon} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Receipts — every rent payment, newest first. A tenant can prove they
// paid in two taps. Replaces the Mpesa-transaction list.

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
};

const Receipts = () => {
  const {payments, isPending, isRefetching, refetch} = useTenantPayments();

  const total = payments.reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Total paid */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>Paid through Keystone</Label>
            <Text className="text-white font-inter-bold text-3xl mt-2" style={{letterSpacing: -0.5}}>
              {usd(total)}
            </Text>
            <Text className="text-white/55 font-inter text-xs mt-1">
              across {payments.length} {payments.length === 1 ? 'payment' : 'payments'} — every one on time
            </Text>
          </Card>
        </View>

        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            All payments
          </Text>
          {isPending ? (
            <Text className="text-text_muted font-inter text-sm ml-1">Loading…</Text>
          ) : payments.length === 0 ? (
            <Card>
              <Text className="text-text_muted font-inter text-sm">
                No payments yet.
              </Text>
            </Card>
          ) : (
            <Card style={{paddingVertical: 6}}>
              {payments.map((p, i) => (
                <View key={p.id}>
                  {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      ToastAndroid.show(`Receipt ${p.code}`, ToastAndroid.SHORT)
                    }
                    className="flex-row items-center px-3 py-3">
                    <IconChip size={38}>
                      <Icon name="card" size={18} color={COLORS.c_success} />
                    </IconChip>
                    <View className="flex-1 ml-3">
                      <Text className="text-keystone_navy font-inter-semibold text-sm">
                        Rent · {p.period}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs mt-0.5">
                        {fmtDate(p.date)} · {p.method}
                      </Text>
                      <Text className="text-text_muted font-inter text-2xs mt-0.5">
                        {p.code}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-keystone_navy font-inter-bold text-sm">
                        {usd(p.amount)}
                      </Text>
                      <Text className="text-c_success font-inter-medium text-2xs mt-0.5 uppercase tracking-wider">
                        Paid
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Receipts;
