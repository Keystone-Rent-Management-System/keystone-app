import React from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import {StatementListSvg} from '@/assets/icons';

const LandlordStatementItem = ({
  title,
  collectAmount,
  overPaid,
  unCollectAmount,
  billAmount,
  date,
  handlePress,
}) => {
  return (
    <TouchableOpacity
      className={
        'mb-4 flex-row justify-between items-center w-full pt-2 pb-3 border-b border-b-border_grey'
      }
      onPress={handlePress}>
      <View className={'flex-row gap-x-3'}>
        <View
          className={
            'h-10 w-10 flex-row justify-center items-center border border-border_grey rounded-full'
          }>
          <StatementListSvg />
        </View>
        <View className={'flex-col gap-y-2'}>
          <Text className={'text-primary font-inter-medium text-xs'}>
            {title}
          </Text>
          <Text className={'font-inter text-2xs text-primary'}>
            Bill:
            <Text className={'text-black'}>KES. {billAmount}</Text>
          </Text>
          <Text className={'text-xs font-inter text-inactive_text'}>
            {date}
          </Text>
        </View>
      </View>

      <View className={'flex-col gap-y-2'}>
        <Text className={'font-inter text-2xs text-green-600'}>
          collected:
          <Text className={'text-black'}>KES. {collectAmount}</Text>
        </Text>
        <Text className={'font-inter text-2xs text-yellow-500'}>
          overpaid:
          <Text className={'text-black'}>KES. {overPaid}</Text>
        </Text>
        <Text className={'font-inter text-2xs text-inactive_text'}>
          uncollected:
          <Text className={'text-black'}>KES. {unCollectAmount}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default LandlordStatementItem;
