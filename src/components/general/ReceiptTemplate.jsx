import React from 'react';
import {Text, View} from 'react-native';
import COLORS from '../../constants/Theme';
import {CButton} from './index';
import {CloseSvg} from '../../assets/icons';

const noOfEllipse = Array(20).fill('_');
const ReceiptTemplate = ({
  children,
  footer,
  color,
  hasCloseBtn = false,
  handleClose,
}) => {
  return (
    <View className={'bg-bg_pale w-full relative pt-8 overflow-x-hidden'}>
      {hasCloseBtn && (
        <CButton
          ClassName={
            'rounded-full bg-slate-300 h-8 w-8 p-0 absolute top-2 right-2'
          }
          onPress={handleClose}>
          <CloseSvg />
        </CButton>
      )}
      {/*ellipses*/}
      <BorderPattern color={color} ClassName={'-top-[7px]'} />

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
      <Seperator color={color} />

      {/*footer*/}
      {footer}

      <BorderPattern color={color} ClassName={'-bottom-[7px]'} />
    </View>
  );
};

const BorderPattern = ({ClassName, color = COLORS.bg}) => (
  <View className={`flex-row space-x-1 absolute inset-x-0.5 ${ClassName}`}>
    {noOfEllipse.map((_, ind) => (
      <View
        style={{backgroundColor: color}}
        key={ind}
        className={'h-3 w-3 rounded-full'}
      />
    ))}
  </View>
);

const Seperator = ({color = COLORS.bg}) => (
  <View className={'flex-row items-center relative  w-full overflow-hidden'}>
    <View
      style={{backgroundColor: color}}
      className={'h-6 w-6 rounded-full -ml-2'}
    />
    <View
      className={'w-[90.5%] flex-row items-center space-x-1 overflow-hidden'}>
      {Array(24)
        .fill('_')
        .map((_, ind) => (
          <View
            style={{backgroundColor: color}}
            key={ind}
            className={'h-0.5 w-3.5 rounded-full '}
          />
        ))}
    </View>
    <View style={{backgroundColor: color}} className={'h-6 w-6 rounded-full'} />
  </View>
);

export default ReceiptTemplate;
