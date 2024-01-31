import React from 'react';
import {CButton, Layout} from '../../../components';
import {Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const MakePayment = () => {
  const navigation = useNavigation();
  return (
    <Layout ClassName={'justify-center items-center px-10 relative'}>
      <View
        className={
          'border-t-4 border-l-4 rounded-full h-14 w-14 mb-5 border-purple-700'
        }
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
