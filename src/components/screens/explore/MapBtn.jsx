import React from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import {ListSvg, MapSvg} from '../../../assets/icons';

const MapBtn = ({mode, handlePress}) => {
  return (
    <View
      className={' absolute right-0 left-0 flex-row justify-center bottom-3'}>
      <TouchableOpacity
        className={
          'p-2.5 rounded-full px-8 shadow-lg flex-row bg-active_text mx-auto'
        }
        onPress={handlePress}>
        <Text className={'text-xs text-white font-inter mr-1'}>
          {mode === 'map' ? 'List' : 'Map'}
        </Text>

        {mode === 'map' ? <ListSvg /> : <MapSvg />}
      </TouchableOpacity>
    </View>
  );
};

export default MapBtn;
