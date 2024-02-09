import React from 'react';
import {Pressable, Text, View} from 'react-native';

import {StatementListSvg} from '@/assets/icons';

const StatementItem = props => {
  return (
    <Pressable
      className={'flex-row space-x-2 py-3.5 border-b border-border_grey'}
      onPress={props.handlePress}>
      {/*  icon */}
      <View
        className={
          'h-10 w-10 flex-row justify-center items-center border border-border_grey rounded-full'
        }>
        <StatementListSvg />
      </View>

      {/*  text  */}
      <View className={'flex-1'}>
        <View className={'flex-row justify-between flex-1'}>
          <Text
            className={'text-primary capitalize text-xs font-inter-semibold'}>
            {/*Invoice #123455*/}
            {props.title}
          </Text>

          <Text className={'text-xs font-inter text-inactive_text'}>
            {/*{moment().format('MMM YYYY')}*/}
            {props.date}
          </Text>
        </View>

        <View className={'flex-row justify-between flex-1 mt-1.5 items-center'}>
          <Text className={'text-xs font-inter text-inactive_text'}>
            {props.paymentMethod}
          </Text>

          <Text className={'text-primary text-xs font-inter-medium'}>
            {props.amount}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default StatementItem;
