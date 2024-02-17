import {View, Text} from 'react-native';
import React from 'react';

const DetailsHeader = () => {
  return (
    <View className={'bg-white flex-row justify-between py-2 px-5'}>
      <Text className={'text-primary font-inter-semibold capitalize text-base'}>
        Account Details
      </Text>
      <Text className={'text-primary font-inter-semibold uppercases'}>
        Save
      </Text>
    </View>
  );
};

export default DetailsHeader;
