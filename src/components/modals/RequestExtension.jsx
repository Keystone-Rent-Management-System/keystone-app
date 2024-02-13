import React, {forwardRef} from 'react';

import {ScrollView, Text, View} from 'react-native';
import {CustomBottomSheet} from './index';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';
import {ExtensionDropDown} from '../screens';

const RequestExtension = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['20%', '60%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <ScrollView className={'px-4 min-h-[180px]'}>
        <View className={'flex-col items-start w-full py-3'}>
          <Text className={'text-black my-1.5 font-inter text-xs'}>
            I would like to request an extension of;
          </Text>
        </View>
        <ExtensionDropDown />
      </ScrollView>

      <CButton
        ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
        onPress={props.handleCloseModal}>
        <Text className={'text-white font-inter text-13 '}>Send Request</Text>
      </CButton>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View className={'border-b border-border_grey mx-5'}>
    <View
      className={
        ' top-0 bg-none  py-3 z-50  flex-row justify-between items-end'
      }>
      <Text className={'font-inter-semibold text-lg text-black'}>
        Request extension
      </Text>

      <CButton
        ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
        onPress={handleClose}>
        <CloseSvg />
      </CButton>
    </View>

    <Text className={'text-xs font-inter text-grey_1 mb-2'}>
      Your rent is due in{' '}
      <Text className={'text-xs font-inter-semibold'}>3days</Text>
    </Text>
  </View>
);

export default RequestExtension;
