import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import {formatToKES} from '../../../utils/Helper';

const PaymentItem = props => {
  return (
    <TouchableOpacity
      className={
        'mb-4 flex-row space-x-3 pt-2 pb-3 border-b border-b-border_grey'
      }
      onPress={props.handlePress}>
      <View
        className={
          'items-center justify-center h-10 w-10 rounded-full bg-white overflow-hidden border border-border_grey'
        }>
        {props.icon}
      </View>

      <View className={'flex-1'}>
        <View className={'flex-row justify-between w-full'}>
          <Text className={'text-primary font-inter-medium text-xs'}>
            {props.transactionCode}
          </Text>
          <Text className={'font-inter text-2xs text-inactive_text'}>
            {props.date}
          </Text>
        </View>

        <View className={'flex-row justify-between w-full mt-2'}>
          <Text className={'font-inter text-xs text-inactive_text'}>
            {props?.paymentMethod}
          </Text>
          <Text className={'text-black font-inter-medium text-xs'}>
            {formatToKES(props.amount)}
          </Text>
        </View>

        <View className={'flex-row justify-between w-full mt-2'}>
          <Text className={'font-inter text-xs text-inactive_text'}>
            Invoice: {props?.invoiceNumber}
          </Text>
          <Text className={'text-black font-inter-medium text-xs'}> </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PaymentItem;
