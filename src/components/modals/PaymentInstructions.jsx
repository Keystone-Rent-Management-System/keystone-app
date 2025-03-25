import {Text, View} from 'react-native';
import React, {forwardRef} from 'react';
import {CustomBottomSheet} from '.';
import {CButton} from '../general';
import {CheckSvg, CloseSvg} from '../../assets/icons';

const PaymentInstructions = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['5%', '40%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <View className={'px-4'}>
        <Text className={'font-open-sauce-sans text-xs text-grey_1'}>
          Use the payment instructions below to make payment to invoice:{' '}
          <Text
            className={
              'font-sometypemono text-xs mt-2 text-center underline text-blue-700'
            }>
            {props?.invoice?.invoiceNumber}
          </Text>
        </Text>

        <View className={'py-5'}>
          <Text className={'font-open-sauce-sans text-xs text-gray-700'}>
            Go to your mpesa menu select Lipa na M-PESA:
          </Text>
          <PaymentInstruction
            title={'Pay bill'}
            value={props?.invoice?.bankMpesaPaybillNumber}
          />
          <PaymentInstruction
            title={'Account no'}
            value={props?.invoice?.accountNumber}
          />
          <PaymentInstruction
            title={'Amount'}
            value={`KES. ${props?.invoice?.dueAmount}`}
          />
        </View>
        <View className="mt-5">
          <Text className={'font-open-sauce-sans text-xs text-gray-700'}>
            After using the instructions above to make a payment, you can return
            to the app and view your payment statement and receipt if you have
            completed the payment to the invoice:{' '}
            <Text
              className={
                'font-sometypemono text-xs mt-2 text-center underline text-blue-700'
              }>
              {props?.invoice?.invoiceNumber}
            </Text>
          </Text>
        </View>
      </View>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View
    className={
      'top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-open-sauce-sans-semibold text-lg text-black'}>
      Payment Instructions
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);

const PaymentInstruction = ({title, value}) => (
  <View className={'flex-row justify-between mr-28'}>
    <View className={'flex-row items-center'}>
      <View className={'mr-2'}>
        <CheckSvg />
      </View>
      <Text className={'text-xs font-open-sauce-sans text-black ml-1 capitalize'}>
        {title}:
      </Text>
    </View>
    <Text className={'text-black font-open-sauce-sans-medium text-12'}>{value}</Text>
  </View>
);

export default PaymentInstructions;
