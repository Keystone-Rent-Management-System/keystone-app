import React from 'react';
import {Pressable, Text, View} from 'react-native';

const StatementItem = props => {
  return (
    <Pressable
      className={'flex-row space-x-2 py-3.5 border-b border-border_grey'}
      onPress={props.handlePress}>
      {/*  text  */}
      <View className={'flex-1'}>
        <View className={'flex-1 flex-row justify-between mt-1.5'}>
          <Text className={'text-xs font-inter text-inactive_text'}>
            {/*{moment().format('MMM YYYY')}*/}
            {props.date}
          </Text>
          <Text
            className={'text-primary capitalize text-xs font-inter-semibold'}>
            {/*Invoice #123455*/}
            {props.title}
          </Text>
          <Text className={'text-xs font-inter text-inactive_text'}>
            {/*KES 1234*/}
            {props.charge}
          </Text>
          <Text className={'text-xs font-inter text-inactive_text'}>
            {/*KES 1234*/}
            {props.paidAmount}
          </Text>
          <Text className={'text-xs font-inter text-inactive_text'}>
            {/*KES 1234*/}
            {props.balance}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default StatementItem;
