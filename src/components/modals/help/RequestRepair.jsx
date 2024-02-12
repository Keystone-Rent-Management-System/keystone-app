import React, {forwardRef} from 'react';

import {ScrollView, Text, View} from 'react-native';
import {CustomBottomSheet} from '../index';
import {CButton} from '../../general';
import {CloseSvg} from '@/assets/icons';

const RequestRepair = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['20%', '60%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <ScrollView className={'px-4'}>
        <Text className={'text-xs font-inter text-grey_1 mb-2'}>
          Report or request for repair. The management will receive the
          notification.
        </Text>
      </ScrollView>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View
    className={
      'top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-inter-semibold text-lg text-black'}>
      Request/Report Repair
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);
export default RequestRepair;

const helpList = [
  {
    title: 'Moving out notice',
    description: 'Issue notice to move out',
  },
  {
    title: 'Make a complaint',
    description: 'Raise a complaint',
  },
  {
    title: 'Request repair',
    description: 'Notify or request repairs',
  },
  {
    title: 'General Assistance',
    description: 'Any other form of assistance',
  },
];
