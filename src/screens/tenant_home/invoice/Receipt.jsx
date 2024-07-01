import React from 'react';
import {Text, View} from 'react-native';
import LottieView from 'lottie-react-native';
import moment from 'moment';

import {InvoiceBillItem, Layout, ReceiptTemplate} from '@/components';
import Success from '@/assets/gif/success.json';

const Receipt = () => {
  return (
    <Layout ClassName={'p-4 px-5 items-center'}>
      <LottieView source={Success} autoPlay loop className={'h-24 w-24 mb-3'} />

      <ReceiptTemplate footer={renderFooter()}>
        <InvoiceBillItem
          txtClassName={'font-sometypemono text-inactive_text'}
          title={'From'}
          amt={'To'}
        />

        <InvoiceBillItem
          txtClassName={'font-sometypemono text-13'}
          title={'Evans Mutambuki'}
          amt={`Purple Haze\n Apartment`}
        />

        <InvoiceBillItem
          txtClassName={'font-sometypemono text-inactive_text'}
          title={'Payment Method'}
          amt={'Code'}
        />

        <InvoiceBillItem
          txtClassName={'font-sometypemono text-13'}
          title={'Mpesa Paybill'}
          amt={`3245632`}
        />
      </ReceiptTemplate>
    </Layout>
  );
};

export default Receipt;

const renderFooter = () => (
  <>
    <InvoiceBillItem
      txtClassName={'font-sometypemono text-13 ml-8 text-inactive_text mb-0'}
      title={'Transaction Date'}
      amt={``}
    />
    <View className={'h-12 px-8 py-1 flex-row justify-between'}>
      <Text className={'text-black font-sometypemono text-15'}>
        {moment().format('hh:mm A')}
      </Text>

      <Text className={'text-black font-sometypemono text-15'}>
        {moment().format('DD MMM YYYY')}
      </Text>
    </View>
  </>
);
