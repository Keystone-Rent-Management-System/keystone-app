import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {forwardRef} from 'react';
import {CustomBottomSheet} from '.';
import {CButton} from '../general';
import {CheckSvg, CloseSvg, RightArrowSvg} from '../../assets/icons';
import {useNavigation} from '@react-navigation/native';

const PaymentMethod = forwardRef((props, ref) => {
  const navigation = useNavigation();
  return (
    <CustomBottomSheet
      snapPoints={['5%', '40%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <View className={'px-4'}>
        <Text className={'font-inter text-xs text-grey_1'}>
          Choose from the options available to choose your preferred way of
          Payment
        </Text>

        <View className={'py-5'}>
          <PayBtn
            title={'Pay via transfer'}
            desc={'Pay through Mpesa / Bank'}
            handlePress={() => {
              props.handleCloseModal();
              navigation.navigate('invoice_make_payment');
            }}
          />
          <PayBtn
            handlePress={() => {
              props.handleCloseModal();
              navigation.navigate('home_stack', {
                screen: 'invoice_receipt',
              });
            }}
            title={'Upload Proof'}
            desc={'Upload proof screenshot'}
          />
        </View>
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
      Payment Method
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

export default PaymentMethod;

const styles = StyleSheet.create({
  actionButtonWrapper: {
    gap: 15,
  },
});
