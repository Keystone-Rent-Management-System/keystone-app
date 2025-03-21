import React from 'react';
import {Text, View} from 'react-native';

export const BillItem = ({
  amt,
  customAmt,
  title,
  txtClassName,
  containerClassName,
}) => (
  <View className={`flex-row justify-between py-2.5 ${containerClassName}`}>
    <View>
      <Text
        className={`font-open-sauce-sans text-black text-xs capitalize ${txtClassName}`}>
        {title}
      </Text>
    </View>

    {amt ? (
      <Text className={`font-open-sauce-sans text-black text-xs ${txtClassName}`}>
        {amt}
      </Text>
    ) : (
      customAmt
    )}
  </View>
);

export default BillItem;
