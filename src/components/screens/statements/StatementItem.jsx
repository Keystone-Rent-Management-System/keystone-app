import React from 'react';
import {Pressable, Text, View} from 'react-native';

const StatementItem = props => {
  return (
    <Pressable
      className={'flex-row space-x-2 py-3.5 border-b border-border_grey'}
      onPress={props.handlePress}>
      {/*  text  */}
      <View
        className={
          'items-center justify-center h-10 w-10 rounded-full bg-white overflow-hidden border border-border_grey'
        }>
        {props.icon}
      </View>

      <View className={'flex-1'}>
        {props.details.map((detail, index) => (
          <View key={index} className={'flex-row justify-between w-full mt-2'}>
            <Text className={'font-inter text-2xs text-inactive_text'}>
              {detail.key}
            </Text>
            <Text className={'text-black font-inter-medium text-xs'}>
              {detail.value}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};

export default StatementItem;
