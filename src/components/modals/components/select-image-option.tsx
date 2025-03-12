import React from 'react';
import {Text, TouchableOpacity, TouchableOpacityProps} from 'react-native';
import {cn} from '../../../utils/tailwind';

interface OptionProps extends TouchableOpacityProps {
  title: string;
  textClassName?: string;
}

export const SelectImageOption = ({
  title,
  textClassName,
  ...rest
}: OptionProps) => (
  <TouchableOpacity
    className="flex-row items-center justify-between py-3 border-b border-slate-50"
    {...rest}>
    <Text
      className={cn(
        'text-gray-800 leading-5 text-base font-inter-medium',
        textClassName,
      )}>
      {title}
    </Text>
  </TouchableOpacity>
);
