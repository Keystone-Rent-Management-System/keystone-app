import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {forwardRef} from 'react';
import {CustomBottomSheet} from '.';
import {CButton} from '../general';
import {CheckSvg, CloseSvg, RightArrowSvg} from '../../assets/icons';
import {LabelledCInput} from '../general/input/CInput';

const PartialPayment = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['5%', '50%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <View className={'px-4'}>
        <Text className={'font-inter text-xs text-grey_1'}>
          Add the amount you are paying. The amount payable is{' '}
          <Text className={'font-semibold text-black'}>KES. 30,000</Text>
        </Text>

        <View className={'py-5 min-h-[70%]'}>
          <LabelledCInput
            label={'Amount'}
            placeholder={'KES.'}
            InputClassName={'py-2 px-3'}
            ClassName={'border-border_grey'}
          />
        </View>

        <CButton
          ClassName={'bg-primary text-white py-3.5'}
          onPress={props.handleProceed}>
          <Text className={'text-white font-inter text-13'}>Proceed</Text>
        </CButton>
      </View>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View
    className={
      ' top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-inter-semibold text-lg text-black'}>
      Amount Paying
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);

const PayBtn = ({title, desc, handlePress}) => (
  <TouchableOpacity
    className={
      'px-5 py-3 border  rounded-xl mb-3 border-border_grey flex-row space-x-3 items-center'
    }
    onPress={handlePress}>
    <CheckSvg />

    <View className={'flex-1'}>
      <Text className={'text-black text-13 font-inter-medium'}>{title}</Text>
      <Text className={'text-xs mt-1 font-inter text-gray-600'}>{desc}</Text>
    </View>

    <View className={''}>
      <RightArrowSvg />
    </View>
  </TouchableOpacity>
);

export default PartialPayment;

const styles = StyleSheet.create({
  actionButtonWrapper: {
    gap: 15,
  },
});
