import React from 'react';
import {Text, View} from 'react-native';

export const BillItem = ({amt, title, txtClassName, containerClassName}) => (
  <View className={`flex-row justify-between py-2.5 ${containerClassName}`}>
    <Text
      className={`font-inter text-black text-xs capitalize ${txtClassName}`}>
      {title}
    </Text>
    <Text className={`font-inter text-black text-xs ${txtClassName}`}>
      {amt}
    </Text>
  </View>
);

export default BillItem;
