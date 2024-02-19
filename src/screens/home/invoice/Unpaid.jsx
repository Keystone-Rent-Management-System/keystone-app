import {StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';

import {Layout} from '@/components';
import invoiceData from '@/provider/invoice';
import {ListingItem} from '../../../components';
import {InvoiceSvg} from '../../../assets/icons';

const Unpaid = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('invoice_view', {id, type: 'unpaid'});
  };
  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={invoiceData.unpaid}
        renderItem={({item}) => renderInvoiceItem(item, handleNavigate)}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export const renderInvoiceItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<InvoiceSvg size={'24'} />}
      id={item?.id}
      title={item?.title}
      date={item?.date}
      unit={item?.unit}
      amount={item?.amount}
      handlePress={handlePress}
    />
  );
};

export const invoiceStyles = StyleSheet.create({
  list: {
    padding: 16,
  },
});
export default Unpaid;
