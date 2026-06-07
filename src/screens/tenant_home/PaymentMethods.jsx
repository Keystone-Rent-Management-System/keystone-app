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

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Label, Divider, Icon, IconChip, StatusPill} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Payment methods — the banks/cards rent can come from.

const PaymentMethods = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const methods = home?.paymentMethods ?? [];

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        <View className="px-5 pt-6 pb-2">
          <Text className="text-keystone_navy font-inter-bold text-2xl">
            Payment methods
          </Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Bank transfers are instant and free. Add a backup card if you like.
          </Text>
        </View>

        {methods.length === 0 && (
          <View className="px-4 mt-3">
            <Card>
              <Text className="text-text_muted font-inter text-sm text-center py-2">
                No payment methods yet. Add a bank or card below to pay rent.
              </Text>
            </Card>
          </View>
        )}

        {methods.length > 0 && (
        <View className="px-4 mt-3">
          <Card style={{paddingVertical: 6}}>
            {methods.map((m, i) => (
              <View key={m.id}>
                {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                <View className="flex-row items-center px-3 py-3.5">
                  <IconChip size={40}>
                    <Icon name={m.type === 'bank' ? 'bank' : 'card'} size={18} color={COLORS.keystone_gold} />
                  </IconChip>
                  <View className="flex-1 ml-3">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">
                      {m.name} ••{m.last4}
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      {m.type === 'bank' ? 'Bank account · instant' : 'Debit card'}
                    </Text>
                  </View>
                  {m.isDefault && <StatusPill label="Default" tone="success" />}
                </View>
              </View>
            ))}
          </Card>
        </View>
        )}

        <View className="px-4 mt-4">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => ToastAndroid.show('Add a payment method — coming soon', ToastAndroid.SHORT)}>
            <Card style={{padding: 16, borderStyle: 'dashed', borderColor: COLORS.keystone_gold, borderWidth: 1}}>
              <View className="flex-row items-center justify-center gap-2">
                <Icon name="bank" size={18} color={COLORS.keystone_gold} />
                <Text className="text-keystone_navy font-inter-semibold text-sm">
                  Add bank or card
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PaymentMethods;
