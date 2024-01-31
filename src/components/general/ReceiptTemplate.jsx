import React from 'react';
import {Text, View} from 'react-native';

const noOfEllipse = Array(20).fill('_');
const ReceiptTemplate = ({children, footer}) => {
  return (
    <View className={'bg-bg_pale w-full relative pt-8 overflow-hidden'}>
      {/*ellipses*/}
      <BorderPattern ClassName={'-top-[7px]'} />

      {/*title*/}
      <View className={'px-8'}>
        <Text
          className={
            'text-black font-sometypemono text-lg mt-2 mb-5 text-center uppercase'
          }>
          Invoice #254668
        </Text>
      </View>

      {/*body*/}
      <View className={'min-h-[150px] px-8'}>{children}</View>
      <Seperator />

      {/*footer*/}
      {footer}

      <BorderPattern ClassName={'-bottom-[7px]'} />
    </View>
  );
};

const BorderPattern = ({ClassName}) => (
  <View className={`flex-row space-x-1 absolute inset-x-0.5 ${ClassName}`}>
    {noOfEllipse.map((_, ind) => (
      <View key={ind} className={'h-3 w-3 bg-bg rounded-full'} />
    ))}
  </View>
);

const Seperator = () => (
  <View className={'flex-row items-center relative  w-full overflow-hidden'}>
    <View className={'h-6 w-6 bg-white rounded-full -ml-2'} />
    <View className={'w-[90.5%] flex-row items-center space-x-1'}>
      {Array(24)
        .fill('_')
        .map((_, ind) => (
          <View key={ind} className={'h-0.5 w-3.5 bg-bg rounded-full '} />
        ))}
    </View>
    <View className={'h-6 w-6 bg-white rounded-full'} />
  </View>
);

export default ReceiptTemplate;
