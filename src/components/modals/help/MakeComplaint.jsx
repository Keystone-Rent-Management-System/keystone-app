import React, {forwardRef} from 'react';

import {ScrollView, Text, TextInput, View} from 'react-native';
import {CustomBottomSheet} from '../index';
import {CloseSvg} from '../../../assets/icons';
import {CButton} from '../../general';
import COLORS from '../../../constants/Theme';

const MakeComplaint = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['20%', '60%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <ScrollView className={'px-4 min-h-[180px]'}>
        <Text className={'text-xs font-inter text-grey_1 mb-2'}>
          Share your complaint with the management to ensure you have a smooth
          experience.
        </Text>

        <View className={'flex-col items-start w-full py-3'}>
          <Text className={'text-black my-1.5 font-inter text-xs'}>
            When would you like to move out?
          </Text>

          <TextInput
            className={
              'border border-border_grey w-full rounded-xl font-inter text-xs px-3'
            }
            numberOfLines={9}
            placeholder={'Briefly explain your complains'}
            placeholderTextColor={COLORS.border_grey}
            style={{
              textAlignVertical: 'top',
            }}
          />
        </View>
      </ScrollView>

      <CButton
        ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
        onPress={props.handleCloseModal}>
        <Text className={'text-white font-inter text-13 '}>
          Submit Complain(s)
        </Text>
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
      Make Complaint
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);

export default MakeComplaint;
