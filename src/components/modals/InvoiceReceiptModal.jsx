import React, {forwardRef} from 'react';
import {CustomBottomSheet} from './index';
import {Text, View} from 'react-native';
import moment from 'moment/moment';
import {InvoiceBillItem} from '../screens';
import {bills} from '../../provider/invoice';
import {ReceiptTemplate} from '../general';

const InvoiceReceiptModal = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['5%', '80%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}
      containerHeight={0}
      contentHeight={0}
      backgroundStyle={{display: 'none'}}
      backdropOpacity={0.9}>
      <View className={'flex-1 p-5'}>
        <ReceiptTemplate
          color={'#000000D0'}
          footer={renderFooter()}
          hasCloseBtn
          handleClose={props.handleCloseModal}>
          <InvoiceBillItem
            txtClassName={'font-sometypemono uppercase text-inactive_text'}
            title={'Bill'}
            amt={'Total'}
          />

          {bills.map((bill, ind) => (
            <InvoiceBillItem
              txtClassName={'font-sometypemono text-13'}
              key={ind}
              title={bill.title}
              amt={`KES.${bill.amount}`}
            />
          ))}

          <InvoiceBillItem
            containerClassName={'mt-3 border-t border-grey_1 py-4 pb-6'}
            txtClassName={'font-sometypemono text-black text-13'}
            title={'Total'}
            amt={'KES.42,000'}
          />
        </ReceiptTemplate>
      </View>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = () => <></>;

export default InvoiceReceiptModal;

const renderFooter = () => (
  <View className={'h-12 px-8 py-3 flex-row justify-between'}>
    <Text className={'text-black font-sometypemono text-15'}>
      {moment().format('hh:mm A')}
    </Text>

    <Text className={'text-black font-sometypemono text-15'}>
      {moment().format('DD MMM YYYY')}
    </Text>
  </View>
);
