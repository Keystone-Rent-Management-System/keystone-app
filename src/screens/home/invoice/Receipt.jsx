import React from 'react';
import {Text, View} from 'react-native';
import LottieView from 'lottie-react-native';

import {Layout, ReceiptTemplate} from '@/components';
import Success from '@/assets/gif/success.json';
import {bills} from '@/provider/invoice';
import {BillItem} from './View';
import moment from 'moment';

const Receipt = () => {
  return (
    <Layout ClassName={'p-4 px-5 items-center'}>
      <LottieView source={Success} autoPlay loop className={'h-24 w-24 mb-3'} />

      <ReceiptTemplate footer={renderFooter()}>
        <BillItem
          txtClassName={'font-sometypemono uppercase text-inactive_text'}
          title={'Bill'}
          amt={'Total'}
        />

        {bills.map((bill, ind) => (
          <BillItem
            txtClassName={'font-sometypemono text-13'}
            key={ind}
            title={bill.title}
            amt={`KES.${bill.amount}`}
          />
        ))}

        <BillItem
          containerClassName={'mt-3 border-t border-grey_1 py-4 pb-6'}
          txtClassName={'font-sometypemono text-black text-13'}
          title={'Total'}
          amt={'KES.42,000'}
        />
      </ReceiptTemplate>
    </Layout>
  );
};

export default Receipt;

const renderFooter = () => (
  <View className={'h-12 px-8 py-3 flex-row justify-between'}>
    <Text className={'text-black font-sometypemono text-15'}>
      {moment().format('hh:mm A')}
    </Text>

    <Text className={'text-black font-sometypemono text-15'}>
      {moment().format('DD MMM YYYY')}
    </Text>
  </View>
);
