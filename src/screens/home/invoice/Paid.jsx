import React from 'react';
import {Layout} from '@/components';
import {FlashList} from '@shopify/flash-list';
import invoiceData from '@/provider/invoice';
import {invoiceStyles, renderInvoiceItem} from './Unpaid';

const Paid = () => {
  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={invoiceData.paid}
        renderItem={renderInvoiceItem}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export default Paid;
