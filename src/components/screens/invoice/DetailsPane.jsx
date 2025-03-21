import React from 'react';
import {Text, View} from 'react-native';

import {Indicator} from '../../../screens/notifications';
import COLORS from '../../../constants/Theme';
import {formatToKES} from '../../../utils/Helper';

const DetailsPane = ({
  title,
  unit,
  amount,
  hasConcern,
  userInvoiced,
  invoiceDate,
}) => (
  <View
    style={{elevation: 10, zIndex: 100}}
    className={
      'bg-bg h-36 absolute inset-x-4 -bottom-16 rounded-xl p-5 flex-row space-x-3 z-50'
    }>
    <View className={'flex-1'}>
      <View className={'flex-row items-center justify-between'}>
        <Text className={'text-2xs font-open-sauce-sans text-inactive_text uppercase'}>
          Invoice For
        </Text>

        {hasConcern ? <ConcernTag text={'Concern'} /> : null}
      </View>

      <Text className={'text-base font-open-sauce-sans-semibold text-black'}>
        {userInvoiced}
      </Text>

      <View className={'mt-4'}>
        <Text className={'text-xs font-open-sauce-sans-medium text-inactive_text'}>
          {title}
        </Text>

        <Text className={'text-xs font-open-sauce-sans-medium text-inactive_text mt-0.5'}>
          {unit}
        </Text>
      </View>
    </View>

    <View
      style={{backgroundColor: COLORS.primary_bg_pale}}
      className={'flex-1 rounded-xl p-3 h-full'}>
      <Text className={'text-2xs font-open-sauce-sans text-inactive_text uppercase'}>
        {parseInt(amount, 9) > 0 ? 'Arrears' : 'Balance'}
      </Text>

      <Text className={'text-base font-open-sauce-sans-semibold text-black'}>
        {formatToKES(amount)}
      </Text>

      <View className={'flex-row space-x-2 items-center pt-4'}>
        <Indicator isArrears={parseInt(amount, 9) > 0} />

        <Text className={'text-2xs font-open-sauce-sans text-black  '}>
          {invoiceDate}
        </Text>
      </View>
    </View>
  </View>
);

export default DetailsPane;

const ConcernTag = ({text}) => (
  <View className={'rounded-full h-5 px-2 bg-red-100 flex-row items-center'}>
    <Text className={'text-red-700 text-[9px] font-open-sauce-sans-medium'}>{text}</Text>
  </View>
);
