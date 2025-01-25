import {View, Text} from 'react-native';
import React from 'react';
import {InvoiceSvg} from '../../../assets/icons';

export default function EmptyInvoice() {
  return (
    <View className="flex-1 items-center justify-center min-h-[80vh] pb-20">
      {/* <View  */}
      <View className="p-6 rounded-full bg-slate-50  ">
        <InvoiceSvg size={40} />
      </View>
      <Text className="text-lg font-medium text-black mb-2 font-inter-medium">
        No Invoices Found!
      </Text>
      <Text className="text-center font-inter text-gray-600">
        Sorry! you have no invoices to show.
      </Text>
    </View>
  );
}
