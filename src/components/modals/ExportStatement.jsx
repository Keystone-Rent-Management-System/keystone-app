import React, {forwardRef} from 'react';

import {ScrollView, Text, View} from 'react-native';
import {CustomBottomSheet} from './index';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';
import DatePicker from './DatePicker';

const ExportStatement = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['5%', '72%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <ScrollView className={'px-4 flex-col '}>
        <DatePicker />
        <View className={'h-3'} />
      </ScrollView>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View
    className={
      ' top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-inter-semibold text-lg text-black'}>
      Export Statement
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);

export default ExportStatement;
