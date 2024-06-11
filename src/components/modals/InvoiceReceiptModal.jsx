import React, {forwardRef} from 'react';
import {CustomBottomSheet} from './index';
import {Text, View} from 'react-native';
import moment from 'moment/moment';
import {InvoiceBillItem} from '../screens';
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
          footer={renderFooter(props?.statement)}
          statement={props?.statement}
          hasCloseBtn
          handleClose={props.handleCloseModal}>
          <InvoiceBillItem
            txtClassName={'font-sometypemono text-inactive_text mt-3'}
            title={'From'}
            amt={'To'}
          />

          <InvoiceBillItem
            txtClassName={'font-sometypemono text-13'}
            title={`${props?.statement?.firstName} ${props?.statement?.lastName}`}
            amt={props?.statement?.propertyUnits?.property?.name}
          />

          <InvoiceBillItem
            txtClassName={'font-sometypemono text-inactive_text'}
            title={'Payment Details'}
            amt={'Code'}
          />

          <InvoiceBillItem
            txtClassName={'font-sometypemono text-13'}
            title={'Mpesa Paybill'}
            amt={
              props?.statement?.propertyUnits?.property?.paymentAccounts
                ?.bankMpesaPaybillNumber
            }
          />

          <InvoiceBillItem
            txtClassName={'font-sometypemono text-13'}
            title={'Account Number'}
            amt={
              props?.statement?.propertyUnits?.property?.paymentAccounts
                ?.accountNumber
            }
          />
          <View className={'h-10'} />
        </ReceiptTemplate>
      </View>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = () => <></>;

export default InvoiceReceiptModal;

const renderFooter = statement => (
  <View className={'h-12 px-8 py-3 flex-row justify-between'}>
    <Text className={'text-black font-sometypemono text-15'}>
      {moment(statement?.transactionDate).format('hh:mm A')}
    </Text>

    <Text className={'text-black font-sometypemono text-15'}>
      {moment(statement?.transactionDate).format('DD MMMM YYYY')}
    </Text>
  </View>
);
