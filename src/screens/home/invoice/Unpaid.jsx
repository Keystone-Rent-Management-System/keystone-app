import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment';

import {Layout} from '@/components';
import invoiceData from '@/provider/invoice';
import {InvoiceSvg} from '@/assets/icons';

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
    <TouchableOpacity
      className={'mb-4 flex-row space-x-3 pb-2 border-b border-b-border_grey'}
      onPress={() => handlePress(item?.id)}>
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
};

export const invoiceStyles = StyleSheet.create({
  list: {
    padding: 16,
  },
});
export default Unpaid;
