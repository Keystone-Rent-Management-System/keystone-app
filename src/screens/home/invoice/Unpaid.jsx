import {StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';

import {Layout, ListingItem} from '@/components';
import {InvoiceSvg} from '@/assets/icons';
import numberWithCommas from '../../../utils/numberWithCommas';
import moment from 'moment';
import {useUnPaidInvoice} from '../../../hooks';

const Unpaid = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('invoice_view', {id});
  };

  const {isPending, invoices, refetch} = useUnPaidInvoice();

  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        refreshing={isPending}
        data={invoices}
        renderItem={({item}) => renderInvoiceItem(item, handleNavigate)}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
        onRefresh={refetch}
      />
    </Layout>
  );
};

export const renderInvoiceItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<InvoiceSvg size={'24'} />}
      id={item?.id}
      title={item?.propertyName?.split('-')[0]}
      customDate={moment(item?.createdAt).format('Do MMM, YYYY')}
      unit={item?.propertyName?.split('-')[1]}
      amount={numberWithCommas(item?.dueAmount)}
      isPartial={item?.paidAmount && item?.paidAmount < item?.totalAmount}
      handlePress={() => handlePress(item?.id)}
    />
  );
};

export const invoiceStyles = StyleSheet.create({
  list: {
    padding: 16,
  },
});
export default Unpaid;
