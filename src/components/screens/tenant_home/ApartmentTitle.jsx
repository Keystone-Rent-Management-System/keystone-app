import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {ArrowDownUpSvg} from '../../../assets/icons';

const ApartmentTitle = ({agreement, refetch}) => {
  return (
    <View className={'flex-row '}>
      <View className={'flex-1'}>
        <Text className={'text-black font-inter-medium text-15'}>
          {agreement?.propertyUnits?.property?.name}
        </Text>

        <Text className={'text-xs mt-1 font-inter text-black'}>
          {' '}
          Unit {agreement?.propertyUnits?.name}
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
