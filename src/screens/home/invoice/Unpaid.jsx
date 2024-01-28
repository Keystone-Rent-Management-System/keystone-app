import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Layout} from '../../../components';
import {FlashList} from '@shopify/flash-list';
import invoiceData from '../../../provider/invoice';
import {InvoiceSvg} from '../../../assets/icons';
import moment from 'moment';

const Unpaid = () => {
  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={invoiceData.unpaid}
        renderItem={renderInvoiceItem}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export const renderInvoiceItem = ({item}) => (
  <TouchableOpacity
    className={'mb-4 flex-row space-x-3 pb-2 border-b border-b-border_grey'}>
    <View
      className={
        'items-center justify-center h-10 w-10 rounded-full bg-white overflow-hidden border border-border_grey'
      }>
      <InvoiceSvg size={'24'} />
    </View>

    <View className={'flex-1'}>
      <View className={'flex-row justify-between w-full'}>
        <Text className={'text-primary font-inter-medium text-xs'}>
          {item?.title}
        </Text>
        <Text className={'font-inter text-2xs text-inactive_text'}>
          {moment(item?.date).format('MMM DD YYYY')}
        </Text>
      </View>

      <View className={'flex-row justify-between w-full mt-2'}>
        <Text className={'font-inter text-2xs text-inactive_text'}>
          {item?.unit}
        </Text>

        <Text className={'text-black font-inter-medium text-xs'}>
          KES. {item?.amount}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export const invoiceStyles = StyleSheet.create({
  list: {
    padding: 16,
  },
});
export default Unpaid;
