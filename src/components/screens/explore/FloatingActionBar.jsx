import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';

const FloatingActionBar = () => (
  <View
    style={styles.floatingBar}
    className={'absolute inset-x-0 bottom-0 bg-bg px-4 py-3 flex-row '}>
    <View className={'flex-1'}>
      <Text className={'text-xs font-inter text-inactive_text'}>
        First installment Amount
      </Text>

      <Text className={'text-lg font-inter text-black'}>
        KES. <Text className={'font-inter-semibold '}>63000</Text>
      </Text>
    </View>

    <View className={'flex-1'}>
      <TouchableOpacity
        className={'bg-primary py-3.5 rounded-lg items-center px-4'}>
        <Text className={'text-xs text-white font-inter-medium'}>
          Contact Owner
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
