import {TouchableOpacity} from 'react-native';
import React from 'react';

const ActionBtn = ({icon, handlePress, ClassName = ''}) => (
  <TouchableOpacity
    className={`p-2 bg-bg_grey rounded-full h-9 w-9 items-center justify-center ${ClassName}`}
    onPress={handlePress}>
    {icon}
  </TouchableOpacity>
);

export default ActionBtn;
