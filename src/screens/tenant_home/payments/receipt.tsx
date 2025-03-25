import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import {formatToKES} from '../../../utils/Helper';
import {PrintSvg, ShareSvg} from '../../../assets/icons/payment';

const Receipt = ({route: {params}}: {route: any}) => {
  const invoice: any = params?.payment;

  return (
    <ScrollView className={'flex-1 bg-bg px-8 pt-5'}>
      {/* receipt */}
      <View className={'p-5 border border-gray-200 pt-9 rounded-xl'}>
        <Text className={'text-xs font-open-sauce-sans text-center mb-2 text-black'}>
          {moment(invoice?.createdAt).format('ddd, MMM D, YYYY • h:mm:ss A')}
        </Text>
        <View className="relative px-3 py-1 border-2 border-dashed mt-5">
          <Text
            className={
              'bg-white p-3 relative text-center -top-7 mx-auto text-black font-open-sauce-sans-medium tracking-wider'
            }>
            PAID
          </Text>

          <Text
            className={
              'font-open-sauce-sans-bold text-lg text-center -mt-7 mb-4 text-black'
            }>
            {formatToKES(invoice?.amountDebited ?? 0) ?? 0}
          </Text>
        </View>

        <View className={'py-3'}>
          <View
            className={'border-b-[1.5px] border-gray-400 border-dashed py-3'}>
            <TextRow
              ClassName={'mb-2'}
              label={'For Invoice'}
              value={invoice?.invoiceNumber ?? ''}
            />
          </View>

          <View
            className={'border-b-[1.5px] border-gray-400 border-dashed py-3'}>
            <TextRow
              ClassName={'mb-2'}
              label={'From'}
              value={`${invoice?.firstName ?? ''} ${invoice?.lastName ?? ''}`}
            />
            <TextRow
              label={'To'}
              value={`${invoice?.propertyName ?? ''} ${
                invoice?.propertyUnitName ?? ''
              }`}
            />
          </View>

          <View
            className={'border-b-[1.5px] border-gray-400 border-dashed py-3'}>
            <TextRow
              ClassName={'mb-2'}
              label={'Payment Method'}
              value={invoice?.methodOfPayment ?? ''}
            />
            <TextRow
              ClassName={'mb-2'}
              label={'Mpesa Paybill'}
              value={'522522'}
            />
            <TextRow label={'Account Number'} value={'7776542'} />
          </View>

          <View
            className={'border-b-[1.5px] border-gray-400 border-dashed py-3'}>
            <TextRow
              ClassName={'mb-2'}
              label={'Amount'}
              value={`${formatToKES(invoice?.amountDebited ?? 0)} KES` ?? ''}
            />
            <TextRow
              label={'Total'}
              value={`${formatToKES(invoice?.amountDebited ?? 0)} KES` ?? ''}
            />
          </View>
        </View>

        <View className={'py-6'}>
          <Text
            className={
              'font-open-sauce-sans text-xs tracking-wide text-black text-center'
            }>
            Thank you for choosing to stay with us.
          </Text>
        </View>
      </View>

      <View className={'flex-row gap-5 justify-center py-3 pb-12'}>
        <TouchableOpacity
          className={
            'justify-center items-center h-14 aspect-square rounded-full border-primary border-[1.5px]'
          }>
          <PrintSvg />
        </TouchableOpacity>

        <TouchableOpacity
          className={
            'justify-center items-center h-14 aspect-square rounded-full border-primary border-[1.5px]'
          }>
          <ShareSvg />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Receipt;

const TextRow = ({
  label,
  value,
  ClassName,
}: {
  label: string;
  value: string;
  ClassName?: string;
}) => {
  return (
    <View className={`flex-row justify-between ${ClassName} `}>
      <Text className={'text-gray-400 text-xs font-open-sauce-sans '}>{label}</Text>

      <Text className={'text-gray-900 text-[13px] font-open-sauce-sans-medium'}>
        {value}
      </Text>
    </View>
  );
};
