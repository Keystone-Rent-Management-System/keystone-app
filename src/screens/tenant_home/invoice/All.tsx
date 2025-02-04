import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {ActivityIndicator, Text} from 'react-native';

import {EmptyInvoiceList, Layout} from '../../../components';
import COLORS from '../../../constants/Theme.js';
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

  if (isPending) {
    return <LoadingLayout text={'Loading Invoices...'} />;
  }

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

const renderEmptyInvoice = () => (
  <EmptyInvoiceList
    title={'No Invoices Found!'}
    subTitle={'Sorry! you have no invoices to show.'}
  />
);

export const LoadingLayout = ({text}: {text: string}) => (
  <Layout ClassName={'px-3 flex-1 justify-center items-center'}>
    <ActivityIndicator color={COLORS.primary} size={50} />
    <Text className="text-primary mt-5 font-inter-medium">{text}</Text>
  </Layout>
);
