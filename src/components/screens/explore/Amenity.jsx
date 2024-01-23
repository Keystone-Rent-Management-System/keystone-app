import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CheckBox from '@react-native-community/checkbox';
import COLORS from '../../../constants/Theme';

const Amenity = ({icon, title, value, showCheckBox = true}) => {
  return (
    <View className={'flex-row justify-between'}>
      <View className={'flex-row items-center'}>
        {showCheckBox && (
          <CheckBox
            disabled={false}
            value={false}
            // onValueChange={(newValue) => setToggleCheckBox(newValue)}
            tintColors={{true: COLORS.primary, false: COLORS.text_color}}
            style={styles.checkBox}
          />
        )}

        {/*  icon */}
        <View className={showCheckBox ? 'mx-2' : 'mr-2'}>{icon}</View>

        {/*  text*/}
        <Text className={'text-xs font-inter text-black ml-1 capitalize'}>
          {title}
        </Text>
      </View>

      {/*  */}
      <Text className={'text-black font-inter-medium text-13'}>{value}</Text>
    </View>
  );
};

export default Amenity;

const styles = StyleSheet.create({
  checkBox: {
    transform: [{scale: 0.9}],
  },
});
