import React, {forwardRef} from 'react';

import {ScrollView, Text, TextInput, View} from 'react-native';
import {CustomBottomSheet} from '../index';
import COLORS from '../../../constants/Theme';
import {CButton} from '../../general';
import {CloseSvg} from '../../../assets/icons';

const GeneralRepairsModal = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['20%', '60%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <ScrollView className={'px-4 min-h-[180px]'}>
        <Text className={'text-xs font-inter text-grey_1 mb-2'}>
          Get help on any other issue not indicated.
        </Text>

        <View className={'flex-col items-start w-full py-3'}>
          <Text className={'text-black my-1.5 font-inter text-xs'}>
            What would you like help with ?
          </Text>

          <TextInput
            className={
              'border border-border_grey w-full rounded-xl font-inter text-xs px-3'
            }
            numberOfLines={5}
            placeholder={'Enter Details'}
            placeholderTextColor={COLORS.border_grey}
            style={{
              textAlignVertical: 'top',
            }}
          />
        </View>

        <View className={'flex-row flex-wrap mt-3 justify-center'}>
          {helpTypes?.map(type => (
            <CButton
              key={type}
              ClassName={
                ' bg-white py-0 rounded-xl border border-primary h-9 m-1.5'
              }
              // onPress={handleClose}
            >
              <Text className={'text-primary font-inter text-xs'}>{type}</Text>
            </CButton>
          ))}
        </View>
      </ScrollView>

      <CButton
        ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
        onPress={props.handleCloseModal}>
        <Text className={'text-white font-inter text-13 '}>Submit</Text>
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
      General Assistance
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);
export default GeneralRepairsModal;

const helpTypes = ['Repairs', 'Notice', 'Complains', 'Call', 'Contact'];
