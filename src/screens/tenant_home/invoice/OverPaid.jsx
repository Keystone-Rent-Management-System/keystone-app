import React, {useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {Layout} from '../../../components';
import {FlashList} from '@shopify/flash-list';
import {invoiceStyles, renderInvoiceItem} from './Unpaid';
import {useNavigation} from '@react-navigation/native';
import {useOverPaidInvoice} from '../../../hooks';

const OverPaid = () => {
  const navigation = useNavigation();
  const [size, setSize] = useState(20);

  const handleNavigate = id => {
    navigation.navigate('invoice_view', {id});
  };

  const {isPending, isRefetching, invoices, totalElements, refetch} =
    useOverPaidInvoice(size);

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
        refreshing={isPending}
        data={invoices}
        renderItem={({item}) => renderInvoiceItem(item, handleNavigate)}
        keyExtractor={item => item.id}
        estimatedItemSize={20}
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

export default OverPaid;
