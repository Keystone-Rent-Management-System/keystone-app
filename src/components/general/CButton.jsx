import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

const CButtonFill = ({ClassName, textClassName, text, children, ...rest}) => {
  return (
    <TouchableOpacity
      className={`justify-center items-center py-2.5 px-5 rounded-xl ${ClassName}`}
      {...rest}>
      {!!text ? (
        <Text className={`font-inter-medium ${textClassName}`}>{text}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default CButtonFill;
