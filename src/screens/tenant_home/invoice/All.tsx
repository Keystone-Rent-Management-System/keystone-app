import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {ActivityIndicator} from 'react-native';

import {EmptyInvoiceList, Layout} from '../../../components';
import {useFetchInvoice} from '../../../hooks/useFetchInvoice.ts';
import {invoiceStyles, renderInvoiceItem} from './Unpaid';

const All = () => {
  const navigation = useNavigation();

  const handleNavigate = (id: string) => {
    // @ts-ignore
    navigation.navigate('invoice_view', {id});
  };

  const {
    invoiceQuery: {isPending, isRefetching, refetch},
    invoices,
    handleLoadMore,
  } = useFetchInvoice('ALL');

  return (
    //   @ts-ignore: missing element children
    <Layout>
      <FlashList
        // ListHeaderComponent={<Header />}
        contentContainerStyle={invoiceStyles.list}
        refreshing={isPending || isRefetching}
        data={invoices}
        renderItem={({item}) =>
          renderInvoiceItem(item, () => handleNavigate(item.id))
        }
        keyExtractor={item => item?.id}
        estimatedItemSize={20}
        onRefresh={refetch}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyInvoice}
        ListFooterComponent={
          isRefetching ? (
            <ActivityIndicator color={'#022374'} size="large" />
          ) : null
        }
      />
    </Layout>
  );
};

export default All;

const renderEmptyInvoice = () => <EmptyInvoiceList />;
