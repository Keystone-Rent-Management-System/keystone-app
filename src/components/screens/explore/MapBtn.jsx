import React from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import {MapSvg} from '../../../assets/icons';

const MapBtn = () => {
  return (
    <View
      className={' absolute right-0 left-0 flex-row justify-center bottom-3'}>
      <TouchableOpacity
        className={
          'p-2.5 rounded-full px-8 shadow-lg flex-row bg-active_text mx-auto'
        }>
        <Text className={'text-xs text-white font-inter mr-1'}>Map</Text>

        <MapSvg />
      </TouchableOpacity>
    </View>
  );
};

export default MapBtn;
