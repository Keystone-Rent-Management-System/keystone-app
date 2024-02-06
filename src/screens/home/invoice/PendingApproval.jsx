import React from 'react';
import {Layout} from '../../../components';
import {FlashList} from '@shopify/flash-list';
import {invoiceStyles, renderInvoiceItem} from './Unpaid';
import invoiceData from '../../../provider/invoice';
import {useNavigation} from '@react-navigation/native';

const PendingApproval = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('invoice_view', {id, type: 'pending'});
  };
  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={invoiceData.pending}
        renderItem={({item}) => renderInvoiceItem(item, handleNavigate)}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export default PendingApproval;
