import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {ArrowDownUpSvg} from '../../../assets/icons';

const RefetchCard = ({refetch}) => {
  return (
    <View className={'relative mb-2'}>
      <View className={'absolute right-4'}>
        <TouchableOpacity
          className={
            'flex-row items-center justify-center bg-bg_pale rounded-lg h-10 w-10'
          }
          onPress={refetch}>
          <ArrowDownUpSvg />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RefetchCard;
