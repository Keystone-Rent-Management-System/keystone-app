import React, {useMemo} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import invoiceData, {bills} from '@/provider/invoice';
import {CButton, Layout} from '@/components';
import COLORS from '@/constants/Theme';
import {RightArrowSvg} from '@/assets/icons';
import {Indicator} from '../../notifications';
import {useNavigation} from '@react-navigation/native';

const InvoiceView = ({route: {params}}) => {
  const navigation = useNavigation();

  const currentInvoice = useMemo(
    () => invoiceData[params?.type]?.find(item => item.id === params?.id),
    [params?.id, params?.type],
  );

  const handleNavigate = (screen, options) => {
    navigation.navigate(screen, options);
  };

  return (
    <Layout ClassName={'relative'}>
      <HeaderSection
        invoiceAmount={currentInvoice.amount}
        invoiceTitle={currentInvoice.title}
        invoiceUnit={currentInvoice.unit}
      />

      {/*  Scroll section*/}
      <ScrollView className={'pt-20 px-4 z-0'} style={{elevation: 0}}>
        <BillItem
          txtClassName={'font-inter text-inactive_text'}
          title={'Bill'}
          amt={'Total'}
        />

        {bills.map((bill, ind) => (
          <BillItem key={ind} title={bill.title} amt={bill.amount} />
        ))}

        <BillItem
          containerClassName={'mt-3 border-t border-gray-200 py-2'}
          txtClassName={'font-inter-semibold text-black text-13'}
          title={'Total'}
          amt={'42,000'}
        />

        <View>
          <Text className={'text-sm font-inter-semibold text-black mt-4'}>
            Does this invoice have an issue?
          </Text>

          <Text className={'font-inter text-xs leading-5 mt-1 text-grey_1'}>
            The invoice has a discrepancy to what you expected,{' '}
            <Text className={'underline text-primary font-inter-semibold'}>
              Raise Concern
            </Text>
          </Text>
        </View>

        <View className={'h-20 w-full'} />
      </ScrollView>
      <Footer
        handleManual={() =>
          handleNavigate('home_stack', {
            screen: 'invoice_receipt',
          })
        }
        handlePrompt={() => handleNavigate('invoice_make_payment')}
      />
    </Layout>
  );
};

export const BillItem = ({amt, title, txtClassName, containerClassName}) => (
  <View className={`flex-row justify-between py-2.5 ${containerClassName}`}>
    <Text
      className={`font-inter text-black text-xs capitalize ${txtClassName}`}>
      {title}
    </Text>
    <Text className={`font-inter text-black text-xs ${txtClassName}`}>
      {amt}
    </Text>
  </View>
);

const HeaderSection = ({invoiceTitle, invoiceAmount, invoiceUnit}) => (
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
    />
  </LinearGradient>
);

const DetailsPane = ({title, unit, amount}) => (
  <View
    style={{elevation: 10, zIndex: 100}}
    className={
      'bg-bg h-36 absolute inset-x-4 -bottom-16 rounded-xl p-5 flex-row space-x-3 z-50'
    }>
    <View className={'flex-1'}>
      <Text className={'text-2xs font-inter text-inactive_text uppercase'}>
        Invoice For
      </Text>

      <Text className={'text-base font-inter-semibold text-black'}>
        Eric Pekmah
      </Text>

      <View className={'mt-4'}>
        <Text className={'text-xs font-inter-medium text-inactive_text'}>
          {title}
        </Text>

        <Text className={'text-xs font-inter-medium text-inactive_text mt-0.5'}>
          {unit}
        </Text>
      </View>
    </View>

    <View
      style={{backgroundColor: COLORS.primary_bg_pale}}
      className={'flex-1 rounded-xl p-3 h-full'}>
      <Text className={'text-2xs font-inter text-inactive_text uppercase'}>
        Amount
      </Text>

      <Text className={'text-base font-inter-semibold text-black'}>
        KES. {amount}
      </Text>

      <View className={'flex-row space-x-2 items-center pt-4'}>
        <Indicator />

        <Text className={'text-2xs font-inter text-black  '}>NOV 14, 2023</Text>
      </View>
    </View>
  </View>
);

const Footer = ({handleManual, handlePrompt}) => (
  <View className={'h-16 p-2 px-4 flex-row w-full bg-bg shadow-xl space-x-4'}>
    <CButton
      ClassName={'bg-none border border-primary flex-1 mr-5'}
      textClassName={'text-primary font-inter text-xs'}
      text={'Pay Manually'}
      onPress={handleManual}
    />

    <CButton
      ClassName={'bg-primary flex-1'}
      textClassName={'text-white font-inter text-xs'}
      text={'Pay Now'}
      onPress={handlePrompt}
    />
  </View>
);
export default InvoiceView;
