import React, {forwardRef} from 'react';
import {CustomBottomSheet} from './index';
import {Text, TouchableOpacity, View} from 'react-native';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';

const InvoiceConcernModal = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['25%', '60%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <View className={'p-4 '}>
        {concerns.map((concern, ind) => (
          <ConcernItem
            key={ind}
            text={concern}
            handlePress={() => props.handleRaiseConcern(concern)}
          />
        ))}
      </View>
    </CustomBottomSheet>
  );
});

export default InvoiceConcernModal;

const ConcernItem = ({text, handlePress}) => (
  <TouchableOpacity
    onPress={handlePress}
    className={'py-3 px-4 bg-gray-200 rounded-full my-2 h-12'}>
    <Text className={'text-black font-open-sauce-sans-medium text-13'}>{text}</Text>
  </TouchableOpacity>
);

const renderSheetHeader = handleClose => (
  <View className={'flex-row p-4 rounded-t-2xl border-b border-gray-200'}>
    <View className={'flex-1'}>
      <Text className={'text-black text-base font-open-sauce-sans-semibold'}>
        Raise Concern on Invoice
      </Text>

      <Text className={' text-xs text-grey_1 font-open-sauce-sans mt-1'}>
        Let the management know the type of discrepancy the invoice has.
      </Text>
    </View>

    <View className={'flex-row'}>
      <CButton
        ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0'}
        onPress={handleClose}>
        <CloseSvg />
      </CButton>
    </View>
  </View>
);

const concerns = [
  'I paid this Invoice',
  'The figures are not correct',
  "The invoices don't belong to me",
];
