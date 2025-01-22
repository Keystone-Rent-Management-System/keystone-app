import React, {useCallback, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-date-picker';

interface IDatePickerProps {
  children: React.ReactNode;
  dateValue?: Date;
  setDateValue?: (date: Date) => void;
}

const CDatePicker = ({dateValue, setDateValue, children}: IDatePickerProps) => {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const _handleConfirm = (_date: Date) => {
    setDate(_date);
    setOpen(false);

    if (setDateValue) {
      setDateValue(_date);
    }
  };

  const _handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <View>
      {/*  Trigger  */}
      <TouchableOpacity onPress={handleToggle}>{children}</TouchableOpacity>

      <DatePicker
        modal
        open={open}
        date={dateValue || date}
        onConfirm={_handleConfirm}
        onCancel={_handleCancel}
      />
    </View>
  );
};

export default CDatePicker;
