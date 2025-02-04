import React from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';

import {ArrowDownUpSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';

const ApartmentTitle = ({agreement, refetch, isLoading}) => {
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
        className={`flex-row items-center justify-center bg-bg_pale rounded-lg h-10 w-10 ${
          isLoading ? 'opacity-90' : ''
        }`}
        onPress={refetch}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size={25} color={COLORS.primary} />
        ) : (
          <ArrowDownUpSvg />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ApartmentTitle;
