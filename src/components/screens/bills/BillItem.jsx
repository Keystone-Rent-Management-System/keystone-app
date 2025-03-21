import React from 'react';

import {Text, View} from 'react-native';

const BillItem = props => (
  <View className={'flex-row space-x-2 py-3.5 border-b border-border_grey'}>
    {/*  icon */}
    <View
      className={
        'h-10 w-10 flex-row justify-center items-center border border-border_grey rounded-full'
      }>
      {props?.icon}
    </View>

    {/*  text  */}
    <View className={'flex-1'}>
      <View className={'flex-row justify-between flex-1 items-center'}>
        <Text className={'text-primary capitalize text-xs font-open-sauce-sans-semibold'}>
          {props?.title}
        </Text>

        <Text className={'text-black text-xs font-open-sauce-sans-semibold'}>
          KES {props?.amount}
        </Text>
      </View>
    </View>
  </View>
);

export default BillItem;
