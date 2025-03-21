import React from 'react';

import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import COLORS from '../../../constants/Theme';

const HouseTypeItem = ({icon, text, isCurrent, handleChoose}) => {
  return (
    <TouchableOpacity
      className={`flex-1 p-3 border border-primary rounded-xl ${
        isCurrent ? 'border-primary ' : 'border-border_grey'
      }`}
      style={isCurrent ? styles.currentHouseTypeItem : styles.houseTypeItem}
      onPress={handleChoose}>
      {icon}

      <Text className={'text-black text-xs mt-6 font-open-sauce-sans'}>{text}</Text>
    </TouchableOpacity>
  );
};

export default HouseTypeItem;

const styles = StyleSheet.create({
  currentHouseTypeItem: {
    backgroundColor: COLORS.primary_bg,
  },
  houseTypeItem: {
    backgroundColor: COLORS.white,
  },
});
