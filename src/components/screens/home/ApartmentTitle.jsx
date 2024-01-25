import {View, Text} from 'react-native';
import React from 'react';
import {ArrowDownUpSvg} from '../../../assets/icons';

const ApartmentTitle = () => {
  return (
    <View className={'flex-row '}>
      <View className={'flex-1'}>
        <Text className={'text-black font-inter-medium text-15'}>
          Ruaka Best homes Apartment
        </Text>

        <Text className={'text-xs mt-1 font-inter text-black'}> Unit 10</Text>
      </View>

      <View
        className={
          'flex-row items-center justify-center bg-bg_pale rounded-lg h-10 w-10'
        }>
        <ArrowDownUpSvg />
      </View>
    </View>
  );
};

export default ApartmentTitle;
