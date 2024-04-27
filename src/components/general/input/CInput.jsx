import React from 'react';

import {Text, TextInput, View} from 'react-native';
import COLORS from '../../../constants/Theme';

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
  hasError,
  ...rest
}) => {
  return (
    <View
      className={`flex-row rounded-xl border items-center ${ClassName} ${
        hasError ? 'border-red-500 border' : ''
      }`}>
      {/*icon*/}
      {icon && icon}

      {/* input */}
      <TextInput
        value={value}
        onChangeText={handleChange}
        maxLength={maxL}
        placeholder={placeHolder}
        placeholderTextColor={placeholderTextColor}
        className={` font-inter flex-1 text-black ${InputClassName} `}
        {...rest}
      />
      {rightElement}
    </View>
  );
};

export const PasswordCInput = ({
  label,
  labelClassName,
  containerClassName,
  hasError,
  error,
  ...props
}) => (
  <View className={` flex flex-col ${containerClassName}`}>
    <Text className={`font-inter-medium text-black mb-2 -2 ${labelClassName}`}>
      {label}
    </Text>
    <CInput
      {...props}
      hasError={hasError}
      secureTextEntry={true}
      textContentType={'password'}
    />
    {hasError && (
      <Text
        className={`font-inter text-xs text-red-500 mt-2 ${labelClassName}`}>
        {error}
      </Text>
    )}
  </View>
);

export const LabelledCInput = ({
  label,
  labelClassName,
  containerClassName,
  hasError,
  error,
  ...props
}) => (
  <View className={` flex flex-col ${containerClassName}`}>
    <Text className={`font-inter-medium text-black mb-2 ${labelClassName}`}>
      {label}
    </Text>
    <CInput hasError={hasError} {...props} />
    {hasError && (
      <Text
        className={`font-inter text-xs text-red-500 mt-2 ${labelClassName}`}>
        {error}
      </Text>
    )}
  </View>
);
export default CInput;
