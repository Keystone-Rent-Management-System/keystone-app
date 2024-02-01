import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Text, TouchableOpacity, View} from 'react-native';

import COLORS from '@/constants/Theme';
import {RightArrowSvg} from '@/assets/icons';
import DetailsPane from './DetailsPane';

const HeaderSection = ({
  invoiceTitle,
  invoiceAmount,
  invoiceUnit,
  hasConcern,
}) => (
  <LinearGradient
    className={`h-2/5 bg-primary relative rounded-b-[30px] z-10`}
    colors={[COLORS.primary, COLORS.gradient_2]}>
    <TouchableOpacity
      className={
        'h-10 w-10 justify-center items-center bg-white rounded-full absolute rotate-180 top-8 left-3'
      }>
      <RightArrowSvg />
    </TouchableOpacity>

    <View className={'absolute px-4 inset-x-0 top-28'}>
      <Text className="text-white font-inter-semibold text-lg">
        {invoiceTitle}
      </Text>

      <Text className={'font-inter text-slate-200 mt-1 text-13'}>
        Invoice #123222
      </Text>
    </View>

    <DetailsPane
      amount={invoiceAmount}
      title={invoiceTitle}
      unit={invoiceUnit}
      hasConcern={hasConcern}
    />
  </LinearGradient>
);

export default HeaderSection;
