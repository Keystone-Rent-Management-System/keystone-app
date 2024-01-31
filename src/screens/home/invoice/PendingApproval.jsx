import React from 'react';
import {Layout} from '../../../components';
import {FlashList} from '@shopify/flash-list';
import {invoiceStyles, renderInvoiceItem} from './Unpaid';
import invoiceData from '../../../provider/invoice';

const PendingApproval = () => {
  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={invoiceData.pending}
        renderItem={({item}) => renderInvoiceItem(item)}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export default PendingApproval;
