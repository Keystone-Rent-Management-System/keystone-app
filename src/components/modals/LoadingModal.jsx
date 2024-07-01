import React from 'react';
import {View, Text} from 'react-native';

const LoadingModal = () => {
  return (
    <View
      className={
        'absolute top-0 left-0 right-0 bottom-0 bg-white flex flex-col gap-3 items-center justify-center'
      }>
      <Text className={'text-gray-500 font-bold'}>Loading . . .</Text>
    </View>
  );
};

export default LoadingModal;
