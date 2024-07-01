import React from 'react';
import {Text, View} from 'react-native';
import LottieView from 'lottie-react-native';

import {CButton, Layout} from '@/components';
import Processing from '@/assets/gif/processing.json';

const MakePayment = () => {
  return (
    <Layout ClassName={'justify-center items-center px-10 relative'}>
      <LottieView
        source={Processing}
        autoPlay
        loop
        className={'h-20 w-20 mb-5'}
      />

      <Text className={'text-2xl font-inter-semibold text-black'}>
        Processing Payment
      </Text>

      <Text className={'font-inter text-grey_1 text-13 mt-2'}>
        We sent you an Mpesa Prompt
      </Text>

      <View className={'h-40 '} />

      <CButton
        ClassName={'bg-gray-300 py-3 px-8 absolute bottom-8 inset-x-12'}
        textClassName={'text-primary'}
        text={'Resend Prompt in 30s'}
      />
    </Layout>
  );
};

export default MakePayment;
