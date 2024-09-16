import React from 'react';
import {Image, Text, View} from 'react-native';

import COLORS from '@/constants/Theme';
import {CButton} from './index';
import {CloseSvg} from '@/assets/icons';
import {DownloadSvg} from '@/assets/icons/receipt';
import logo from '@/assets/images/logo.png';
import numberWithCommas from '../../utils/numberWithCommas';

const noOfEllipse = Array(35).fill('_');
const ReceiptTemplate = ({
  children,
  footer,
  color,
  hasCloseBtn = false,
  handleClose,
  receipt,
}) => {
  return (
    <View className={'bg-bg_pale w-full relative pt-3 overflow-x-hidden'}>
      {/*ellipses*/}
      <BorderPattern color={color} ClassName={'-top-[7px]'} />

      <View className={'px-6 flex-row pt-2 items-center justify-between'}>
        <Text className={'text-black font-sometypemono text-xs'}>
          Receipt No: {receipt?.invoiceNumber}
        </Text>

        <View className={'flex-row space-x-2 items-center'}>
          <CButton
            ClassName={'bg-slate-200 px-2 h-6 py-0 text-xs flex-row space-x-1'}
            textClassName={'text-2xs text-black'}>
            <DownloadSvg />
            <Text className={'font-sometypemono text-black text-xs'}>
              Download
            </Text>
          </CButton>
          {hasCloseBtn && (
            <CButton
              ClassName={'rounded-full bg-slate-300 h-8 w-8 p-0 -mr-5'}
              onPress={handleClose}>
              <CloseSvg />
            </CButton>
          )}
        </View>
      </View>

      <Image
        className={'h-16 w-28 object-cover mx-auto'}
        source={logo}
        alt={'logo'}
      />

      <Text className={'font-sometypemono text-black text-xl mx-auto'}>
        KES. {numberWithCommas(Number(receipt?.totalAmount))}
      </Text>

      <Text className={'text-black font-sometypemono text-xs mt-2 text-center'}>
        For Invoice:{' '}
        <Text
          className={
            'font-sometypemono text-xs mt-2 text-center underline text-blue-700'
          }>
          {receipt?.invoiceNumber}
        </Text>
      </Text>

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
  <View
    className={`flex-row space-x-1 absolute inset-x-0.5 overflow-x-hidden ${ClassName}`}>
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
