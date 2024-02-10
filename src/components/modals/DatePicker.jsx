import React, {forwardRef, useCallback, useMemo, useRef, useState} from 'react';

import {Calendar} from 'react-native-calendars';
import {CalendarSvg} from '../../assets/icons';
import {Text, TouchableOpacity, View} from 'react-native';

const DatePicker = forwardRef((props, ref) => {
  const {handleClose, handleOpen, handleFilter, date} = props;
  const dateModalRef = useRef();

  const [initDate] = useState(new Date());
  const [range, setRange] = useState({});

  // Using useMemo to perform calculations only if range is modified
  const marked = useMemo(() => {
    if (!range.startDate) return {};

    let start = new Date(range.startDate).getTime();
    let end = new Date(range.endDate || range.startDate).getTime();
    let marked = {};

    for (let cur = start; cur <= end; cur += 60 * 60 * 24000) {
      let curStr = new Date(cur).toISOString().substr(0, 10);
      marked[curStr] = {
        selected: true,
        color: '#aabbee',
        textColor: 'black',
        startingDay: cur == start,
        endingDay: cur == end,
      };
    }
    return marked;
  }, [range]);

  const handleOpenDateModal = useCallback(() => {
    dateModalRef.current?.expand();
  }, []);

  const handleCloseDateModal = useCallback(() => {
    dateModalRef.current?.close();
  }, []);

  function handleDayPress(day) {
    if (range.startDate && !range.endDate) {
      // startDate is selected. Complete the range selection
      let newRange = {...range, ...{endDate: day.dateString}};

      setRange(newRange);
    } else {
      // startDate isn't selected. Start the range selection
      setRange({
        startDate: day.dateString,
      });
    }
  }

  return (
    <>
      <View className={'flex-col items-start w-full'}>
        <Text className={'text-grey_1 my-1.5 font-inter text-xs'}>
          Start Date
        </Text>
        <TouchableOpacity
          className={
            'p-1 border border-gray-300 rounded-lg h-12 flex-row items-center px-3 w-full'
          }
          onPress={handleOpenDateModal}>
          <View className={'flex-1'}>
            <Text className={'text-gray-500 font-inter text-xs mr-2'}>
              {date?.startDate && date?.endDate
                ? `${date?.startDate || ''} - ${date?.endDate || ''}`
                : 'select date '}
            </Text>
          </View>
          <CalendarSvg />
        </TouchableOpacity>
      </View>

      <View
        className={
          ' bg-white border border-border_grey rounded-xl overflow-hidden mt-3 shadow mx-1 px-0.5'
        }>
        <Calendar
          initialDate={initDate?.toDateString()}
          markedDates={marked}
          markingType="period"
          maxDate={new Date()}
          onDayPress={handleDayPress}
          textDayFontSize={'50px'}
        />
      </View>
    </>
  );
});

export default DatePicker;
