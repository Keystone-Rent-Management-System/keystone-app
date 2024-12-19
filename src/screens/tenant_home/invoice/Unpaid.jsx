import {ActivityIndicator, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';

import {Layout, ListingItem} from '../../../components';
import {InvoiceSvg} from '../../../assets/icons';
import moment from 'moment';
import {useUnPaidInvoice} from '../../../hooks';
import numberConverter from '../../../utils/numberConverter';

const Unpaid = () => {
  const navigation = useNavigation();
  const [size, setSize] = useState(20);

  const handleNavigate = id => {
    navigation.navigate('invoice_view', {id});
  };

  const {isPending, isRefetching, invoices, totalElements, refetch} =
    useUnPaidInvoice(size);

  const handleLoadMore = () => {
    if (!isPending && !isRefetching && totalElements > size) {
      setSize(prev => prev + 10);
      refetch();
    }
  };

  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        refreshing={isPending || isRefetching}
        data={invoices}
        renderItem={({item}) => renderInvoiceItem(item, handleNavigate)}
        keyExtractor={item => item?.id}
        estimatedItemSize={300}
        onRefresh={refetch}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isRefetching ? (
            <ActivityIndicator color={'#022374'} size="large" />
          ) : null
        }
      />
    </Layout>
  );
};

export const renderInvoiceItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={
        <InvoiceSvg
          color={item.paymentStatus === 'PAID' ? '#00000090' : null}
          size={24}
        />
      }
      title={item?.propertyName?.split('-')[0]}
      customDate={moment(item?.updatedAt)?.format('Do MMMM, YYYY')}
      unit={item?.propertyName?.split('-')[1]}
      amount={numberConverter(item?.totalAmount)}
      isPartial={item?.paymentStatus?.toLowerCase() === 'paid_partially'}
      handlePress={() => handlePress(item?.id)}
      paymentStatus={item?.paymentStatus || ''}
    />
  );
};

export const invoiceStyles = StyleSheet.create({
  list: {
    padding: 16,
  },
});
export default Unpaid;
