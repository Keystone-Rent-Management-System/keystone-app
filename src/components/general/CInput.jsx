import React from 'react';

import {TextInput, View} from 'react-native';

const CInput = ({
  icon,
  value,
  handleChange,
  maxL,
  placeHolder,
  inputClassName,
  ClassName,
  InputClassName,
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
        className={InputClassName}
        {...rest}
      />
    </View>
  );
};

export default CInput;
