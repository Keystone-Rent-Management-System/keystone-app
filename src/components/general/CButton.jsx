import React from 'react';
import {ActivityIndicator, Text, TouchableOpacity} from 'react-native';

const CButtonFill = ({
  ClassName,
  textClassName,
  text,
  children,
  isLoading,
  disabled,
  ...rest
}) => {
  return (
    <TouchableOpacity
      disabled={isLoading || disabled}
      style={{gap: 6}}
      className={`flex-row justify-center items-center py-2.5 px-5 rounded-xl ${ClassName} ${
        isLoading || disabled ? 'opacity-60' : ''
      }`}
      {...rest}>
      {text ? (
        <Text className={`font-inter-medium ${textClassName}`}>{text}</Text>
      ) : (
        children
      )}

      {isLoading && <ActivityIndicator size="small" color="#fff" />}
    </TouchableOpacity>
  );
};

export default CButtonFill;
