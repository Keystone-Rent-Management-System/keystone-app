import React, {forwardRef, useState} from 'react';

import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {CustomBottomSheet} from '../index';
import {AlertBar, CButton} from '../../general';
import {CloseSvg} from '@/assets/icons';
import {CalendarSvg, NotificationsSvg} from '../../../assets/icons';
import {useSendTerminationNotice} from '../../../hooks/useAgrement';

const MovingOut = forwardRef((props, ref) => {
  const [selected, setSelected] = useState('');

  const {handleSendTerminationNotice} = useSendTerminationNotice(
    props.handleCloseModal,
  );

  return (
    <CustomBottomSheet
      snapPoints={['20%', '87%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <ScrollView className={'px-4 min-h-[180px]'}>
        <Text className={'text-xs font-inter text-grey_1 mb-2'}>
          Issue notice to move out, kindly note that the notice should be given
          out{' '}
          <Text className={'font-bold text-black'}>
            {' '}
            {props?.agreement?.daysOfTerminationNotice} days
          </Text>{' '}
          the actual move out date.
        </Text>

        <View className={'py-3 mb-2'}>
          <View className={'flex-col items-start w-full'}>
            <Text className={'text-black my-1.5 font-inter text-xs'}>
              When would you like to move out?
            </Text>
            <TouchableOpacity
              className={
                'p-1 border border-gray-300 rounded-xl h-14 flex-row items-center px-3 w-full'
              }>
              <View className={'flex-1'}>
                <Text className={'text-gray-500 font-inter text-13 mr-2'}>
                  {selected ? selected : 'select date '}
                </Text>
              </View>
              <CalendarSvg />
            </TouchableOpacity>
          </View>
          <View
            className={
              'bg-white border border-border_grey rounded-xl overflow-hidden mt-3 shadow mx-1 px-0.5'
            }>
            <Calendar
              onDayPress={day => {
                setSelected(day.dateString);
              }}
              markedDates={{
                [selected]: {
                  selected: true,
                  disableTouchEvent: true,
                  selectedDotColor: 'orange',
                },
              }}
            />
          </View>
        </View>

        <AlertBar
          icon={<NotificationsSvg color={'#A27607'} />}
          message={'The Management will be notified of the date '}
        />
      </ScrollView>

      <CButton
        ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
        onPress={() =>
          handleSendTerminationNotice({
            agreementsId: props?.agreement,
            vacationDate: selected,
          })
        }>
        <Text className={'text-white font-inter text-13 '}>Issue Notice</Text>
      </CButton>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View
    className={
      ' top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-inter-semibold text-lg text-black'}>
      Moving out notice
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);
export default MovingOut;
