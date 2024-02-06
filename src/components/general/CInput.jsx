import React from 'react';

import {Text, TextInput, View} from 'react-native';
import COLORS from '../../constants/Theme';

const CInput = ({
  icon,
  value,
  handleChange,
  maxL,
  placeHolder = 'Hellow',
  inputClassName,
  ClassName,
  InputClassName,
  rightElement,
  placeholderTextColor = COLORS.inactive_text,
  ...rest
}) => {
  return (
    <View className={`flex-row rounded-xl border  ${ClassName}`}>
      {/*icon*/}
      {icon && icon}

      {/* input */}
      <TextInput
        value={value}
        onChange={handleChange}
        maxLength={maxL}
        placeholder={placeHolder}
        placeholderTextColor={placeholderTextColor}
        className={` font-inter flex-1 text-black ${InputClassName}`}
        {...rest}
      />
      {rightElement}
    </View>
  );
};

export const LabelledCInput = ({
  label,
  labelClassName,
  containerClassName,
  ...props
}) => (
  <View className={` flex flex-col ${containerClassName}`}>
    <Text className={`font-inter-medium text-black mb-2 -2 ${labelClassName}`}>
      {label}
    </Text>
    <CInput {...props} />
  </View>
);
export default CInput;
