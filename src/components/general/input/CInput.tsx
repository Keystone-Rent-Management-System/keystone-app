import React from 'react';

import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import COLORS from '../../../constants/Theme';
import {ClosedEyeSvg, OpenEyeSvg} from '../../../assets/icons/auth';
import {TextInputProps} from 'react-native/Libraries/Components/TextInput/TextInput';

interface ICInputProps extends TextInputProps {
  icon?: React.ReactNode;
  value?: string;
  handleChange?: (text: string) => void;
  maxL?: number;
  placeHolder?: string;
  ClassName?: string;
  InputClassName?: string;
  rightElement?: React.ReactNode;
  placeholderTextColor?: string;
  hasError?: boolean;
}

const CInput = ({
  icon,
  value,
  handleChange,
  maxL,
  placeHolder = 'Hellow',
  ClassName,
  InputClassName,
  rightElement,
  placeholderTextColor = COLORS.inactive_text,
  hasError,
  ...rest
}: ICInputProps) => {
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

interface IPasswordCInputProps extends ICInputProps {
  label: string;
  labelClassName?: string;
  containerClassName?: string;
  hasError?: boolean;
  handleEyeClick: (type: string) => void;
  type: string;
  error?: string;
}
export const PasswordCInput = ({
  label,
  labelClassName,
  containerClassName,
  hasError,
  handleEyeClick,
  type,
  error,
  ...props
}: IPasswordCInputProps) => (
  <View className={` flex flex-col ${containerClassName}`}>
    <Text className={`${labelClassName} font-inter-medium text-black mb-2 -2 `}>
      {label}
    </Text>
    <CInput
      {...props}
      hasError={hasError}
      secureTextEntry={type === 'password'}
      textContentType={'password'}
      rightElement={
        <TouchableOpacity
          onPress={() => {
            type === 'password'
              ? handleEyeClick('text')
              : type === 'text' && handleEyeClick('password');
          }}>
          {type === 'password' ? <ClosedEyeSvg /> : <OpenEyeSvg />}
        </TouchableOpacity>
      }
    />
    {hasError && (
      <Text
        className={`${labelClassName} font-inter text-xs text-red-500 mt-2 `}>
        {error}
      </Text>
    )}
  </View>
);

interface ILabelledCInputProps extends ICInputProps {
  label: string;
  labelClassName?: string;
  containerClassName?: string;
  hasError?: boolean;
  error?: string;
}
export const LabelledCInput = ({
  label,
  labelClassName,
  containerClassName,
  hasError = false,
  error,
  ...props
}: ILabelledCInputProps) => (
  <View className={` flex flex-col ${containerClassName}`}>
    <Text className={`font-inter-medium text-black mb-2 ${labelClassName}`}>
      {label}
    </Text>
    <CInput hasError={hasError} {...props} />
    {hasError && (
      <Text
        className={` ${labelClassName} font-inter text-xs text-red-500 mt-2`}>
        {error}
      </Text>
    )}
  </View>
);
export default CInput;
