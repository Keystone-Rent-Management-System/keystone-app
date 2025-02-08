import {Text, View} from 'react-native';
import React from 'react';
import {InvoiceSvg} from '../../../assets/icons';

interface IEmptyList {
  title: string;
  subTitle: string;
  icon?: React.ReactNode;
}

export default function EmptyList({title, subTitle, icon}: IEmptyList) {
  return (
    <View className="flex-1 items-center justify-center min-h-[80vh] pb-20">
      {/* <View  */}
      <View className="p-6 rounded-full bg-slate-50  ">
        {icon ?? <InvoiceSvg size={40} />}
      </View>
      <Text className="text-lg font-medium text-black mb-2 font-inter-medium">
        {title}
        {/*No Invoices Found!*/}
      </Text>
      <Text className="text-center font-inter text-gray-600">
        {subTitle}
        {/*Sorry! you have no invoices to show.*/}
      </Text>
    </View>
  );
}
