import React from 'react';
import {Text, View} from 'react-native';

import {CDatePicker} from '../../general';
import {CalendarSvg} from '../../../assets/icons';

interface IStatementDatePickerProps {
  label: string;
  placeholder: string;
  value?: Date;
  setValue?: (date: Date) => void;
}

const StatementDatePicker = ({
  label,
  placeholder = 'Select Date',
  value,
  setValue,
}: IStatementDatePickerProps) => {
  return (
    <CDatePicker dateValue={value} setDateValue={setValue}>
      {/*  label  */}
      <Text className={'text-black font-inter mb-2 text-sm '}>{label}</Text>
      {/*  selector  */}
      <View
        className={
          'border border-[#DEDEDE] py-3 px-3 mb-1 flex-row rounded-xl justify-between items-center'
        }>
        <Text
          className={`${
            value ? 'text-gray-800' : 'text-gray-600'
          } font-inter text-[13px]`}>
          {value ? value.toDateString() : placeholder}
        </Text>

        <CalendarSvg />
      </View>
    </CDatePicker>
  );
};

export default StatementDatePicker;
