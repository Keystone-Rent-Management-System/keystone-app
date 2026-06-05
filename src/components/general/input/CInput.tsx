import React, {useRef} from 'react';

import {Pressable, Text, TextInput, TouchableOpacity, View} from 'react-native';
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
  // The TextInput only covers its own glyphs; tapping the icon or the
  // row padding did nothing, so users tapping the field's icon saw no
  // keyboard. Make the whole row focus the input.
  const inputRef = useRef<TextInput>(null);
  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      className={`flex-row rounded-xl border items-center ${ClassName} ${
        hasError ? 'border-red-500 border' : ''
      }`}>
      {/*icon*/}
      {icon && icon}

      {/* input */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        maxLength={maxL}
        placeholder={placeHolder}
        placeholderTextColor={placeholderTextColor}
        className={` font-open-sauce-sans flex-1 text-black ${InputClassName} `}
        {...rest}
      />
      {rightElement}
    </Pressable>
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
    <Text className={`${labelClassName} font-open-sauce-sans-medium text-black mb-2 -2 `}>
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
        className={`${labelClassName} font-open-sauce-sans text-xs text-red-500 mt-2 `}>
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
    <Text className={`font-open-sauce-sans-medium text-black mb-2 ${labelClassName}`}>
      {label}
    </Text>
    <CInput hasError={hasError} {...props} />
    {hasError && (
      <Text
        className={` ${labelClassName} font-open-sauce-sans text-xs text-red-500 mt-2`}>
        {error}
      </Text>
    )}
  </View>
);
export default CInput;
