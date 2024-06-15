import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {ArrowDownUpSvg} from '../../../assets/icons';

const ApartmentTitle = ({invoice, refetch}) => {
  return (
    <View className={'flex-row '}>
      <View className={'flex-1'}>
        <Text className={'text-black font-inter-medium text-15'}>
          {invoice?.propertyName?.split('-')[0]}
        </Text>

        <Text className={'text-xs mt-1 font-inter text-black'}>
          {' '}
          Unit {invoice?.propertyName?.split('-')[1]}
        </Text>
      </View>

      <TouchableOpacity
        className={
          'flex-row items-center justify-center bg-bg_pale rounded-lg h-10 w-10'
        }
        onPress={refetch}>
        <ArrowDownUpSvg />
      </TouchableOpacity>
    </View>
  );
};

export default ApartmentTitle;
