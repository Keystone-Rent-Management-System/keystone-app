import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

const CButtonFill = ({ClassName, textClassName, text}) => {
  return (
    <TouchableOpacity
      className={`justify-center items-center py-2.5 px-5 rounded-xl ${ClassName}`}>
      <Text className={`font-inter-medium ${textClassName}`}>{text}</Text>
    </TouchableOpacity>
  );
};

export default CButtonFill;
