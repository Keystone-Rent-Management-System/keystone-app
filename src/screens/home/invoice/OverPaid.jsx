import React from 'react';
import {Layout} from '../../../components';
import {FlashList} from '@shopify/flash-list';
import {invoiceStyles, renderInvoiceItem} from './Unpaid';
import {useNavigation} from '@react-navigation/native';
import {useOverPaidInvoice} from '../../../hooks';

const OverPaid = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('invoice_view', {id});
  };

  const {isPending, invoices, refetch} = useOverPaidInvoice();

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

export default OverPaid;
