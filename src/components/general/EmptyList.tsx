import React from 'react';
import {Image, Text, View} from 'react-native';

// @ts-ignore
import emptyImage from '../../assets/images/empty.png';

type EmptyListProps = {
  title?: string;
  message?: string;
};

const EmptyList = ({
  title = 'List Empty!',
  message = 'You have no data to display!',
}: EmptyListProps) => {
  return (
    <View
      className={
        'h-80 flex flex-col font-open-sauce-sans justify-center items-center gap-3'
      }>
      <Image
        source={emptyImage}
        resizeMode={'contain'}
        className={'h-20 opacity-50'}
      />

      <View className={'text-center flex items-center'}>
        <Text className={'text-gray-500 text-sm font-open-sauce-sans-medium'}>
          {title}
        </Text>
        <Text className={'text-gray-500 text-xs font-open-sauce-sans mt-1'}>
          {message}
        </Text>
      </View>
    </View>
  );
};

export default EmptyList;
