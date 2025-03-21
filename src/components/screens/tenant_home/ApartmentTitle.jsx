import React from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';

import {RefreshSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import UnitSelector from './unit-selector';

const ApartmentTitle = ({handleSelect, refetch, isLoading}) => {
  return (
    <View className={'flex-row '}>
      <UnitSelector onPress={handleSelect} />

      <TouchableOpacity
        className={`flex-row items-center justify-center bg-bg_pale rounded-lg h-10 w-10 ${
          isLoading ? 'opacity-90' : ''
        }`}
        onPress={refetch}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size={25} color={COLORS.primary} />
        ) : (
          <RefreshSvg />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ApartmentTitle;
