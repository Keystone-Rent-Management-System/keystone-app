import {TouchableOpacity, TouchableOpacityProps} from 'react-native';
import React from 'react';

interface ActionBtnProps extends TouchableOpacityProps {
  icon: React.ReactElement;
  handlePress: () => void;
  ClassName?: string;
}

const ActionBtn = ({
  icon,
  handlePress,
  ClassName = '',
  ...rest
}: ActionBtnProps) => (
  <TouchableOpacity
    className={`p-2 bg-bg_grey rounded-full h-9 w-9 items-center justify-center ${ClassName}`}
    onPress={handlePress}
    {...rest}>
    {icon}
  </TouchableOpacity>
);

export default ActionBtn;
