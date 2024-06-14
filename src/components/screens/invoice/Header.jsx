import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Text, TouchableOpacity, View} from 'react-native';

import COLORS from '@/constants/Theme';
import {RightArrowSvg} from '@/assets/icons';
import DetailsPane from './DetailsPane';
import {useNavigation} from '@react-navigation/native';
import Badge from '../explore/Badge';

const HeaderSection = ({
  invoiceTitle,
  invoiceAmount,
  invoiceUnit,
  hasConcern,
  isPartial,
  invoiceNo,
  userInvoiced,
  invoiceDate,
}) => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      className={`h-2/5 bg-primary relative rounded-b-[30px] z-10`}
      colors={[COLORS.primary, COLORS.gradient_2]}>
      <TouchableOpacity
        className={
          'h-10 w-10 justify-center items-center bg-white rounded-full absolute rotate-180 top-8 left-3'
        }
        onPress={handleGoBack}>
        <RightArrowSvg />
      </TouchableOpacity>

      <View className={'absolute px-4 inset-x-0 top-24'}>
        {isPartial ? (
          <View className={'flex-row mb-3'}>
            <Badge ClassName={'bg-green-100 px-3'}>
              <Text className={'text-2xs text-c_green font-inter'}>
                Partially Paid
              </Text>
            </Badge>
          </View>
        ) : null}
        <Text className="text-white font-inter-semibold text-lg">
          {invoiceTitle}
        </Text>

        <Text className={'font-inter text-slate-200 mt-1 text-13'}>
          Invoice {invoiceNo}
        </Text>
      </View>

      <DetailsPane
        amount={invoiceAmount}
        title={invoiceTitle}
        unit={invoiceUnit}
        hasConcern={hasConcern}
        userInvoiced={userInvoiced}
        invoiceDate={invoiceDate}
      />
    </LinearGradient>
  );
};

export default HeaderSection;
