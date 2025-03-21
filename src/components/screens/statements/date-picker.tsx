import React from 'react';
import {Text, View} from 'react-native';
import moment from 'moment';

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
      <Text className={'text-black font-open-sauce-sans mb-2 text-sm '}>{label}</Text>
      {/*  selector  */}
      <View
        className={
          'border border-[#DEDEDE] py-3 px-3 mb-1 flex-row rounded-xl justify-between items-center'
        }>
        <Text
          className={`${
            value ? 'text-gray-800' : 'text-gray-600'
          } font-open-sauce-sans text-[13px]`}>
          {value ? moment(value).format('MM DD YYYY') : placeholder}
        </Text>

        <CalendarSvg />
      </View>
    </CDatePicker>
  );
};

export default StatementDatePicker;
