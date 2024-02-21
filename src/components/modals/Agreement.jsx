import React, {forwardRef} from 'react';

import {ScrollView, Text, View} from 'react-native';
import CustomBottomSheetModal from './CustomBottomSheetModal';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';

const AgreementModalSheet = forwardRef((props, ref) => {
  return (
    <CustomBottomSheetModal
      ref={ref}
      snapPoints={['50%', '95%']}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}>
      <ScrollView className={'px-4 flex-col '}>
        <Text className={'text-black'}>Hellow world</Text>
      </ScrollView>
    </CustomBottomSheetModal>
  );
});
export default AgreementModalSheet;

const renderSheetHeader = handleClose => (
  <View
    className={
      ' top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <View>
      <Text className={'font-inter-semibold text-lg text-black'}>
        Agreement
      </Text>
    </View>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);
