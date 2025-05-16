import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import Helper from '@/utils/Helper';

const FloatingActionBar = ({
  amount,
  isRent,
  phoneNumber,
}: {
  amount: string;
  isRent: boolean;
  phoneNumber: string;
}) => (
  <View
    style={styles.floatingBar}
    className={'absolute inset-x-0 bottom-0 bg-bg px-4 py-3 flex-row '}>
    {isRent ? (
      <View className={'flex-1'}>
        <Text className={'text-xs font-open-sauce-sans text-inactive_text'}>
          First installment Amount
        </Text>

        <Text className={'text-lg font-open-sauce-sans text-black'}>
          KES.{' '}
          <Text className={'font-open-sauce-sans-semibold '}>{amount}</Text>
        </Text>
      </View>
    ) : null}

    <View className={'flex-1'}>
      <TouchableOpacity
        className={'bg-primary py-3.5 rounded-lg items-center px-4'}
        onPress={() => {
          Helper.handleCall(phoneNumber);
        }}>
        <Text className={'text-xs text-white font-open-sauce-sans-medium'}>
          Contact Pallax
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  floatingBar: {
    elevation: 2,
  },
});
export default FloatingActionBar;
