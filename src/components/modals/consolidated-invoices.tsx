import BottomSheet from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import React, {forwardRef} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

import {CloseSvg, InvoiceSvg} from '../../assets/icons';
import {Invoice} from '../../types/invoice';
import {CButton} from '../general';
import CustomBottomSheet from './CustomBottomSheet';

interface IConsolidatedInvoices {
  invoice: Invoice;
  handleCloseFilter: () => void;
}

const ConsolidatedInvoices = forwardRef<BottomSheet, IConsolidatedInvoices>(
  ({handleCloseFilter, invoice}, ref) => {
    const navigation = useNavigation();

    const handleNavigate = (id: string) => {
      // @ts-ignore
      navigation.navigate('invoice_view', {id});
      handleCloseFilter();
    };

    return (
      <CustomBottomSheet
        ref={ref}
        snapPoints={['81%', '81%']}
        handleComponent={() =>
          renderSheetHeader('Consolidated Invoices', handleCloseFilter)
        }>
        <View className="px-5 py-2 flex-1">
          <Text className="text-gray-500 font-open-sauce-sans leading-5">
            This shows the aggregated invoices for the invoice:{' '}
            <Text className="text-primary text-13 font-open-sauce-sans-medium">
              {invoice?.invoiceNumber}
            </Text>
          </Text>

          <FlashList
            contentContainerStyle={styles.contentContainer}
            data={invoice?.invoiceItemIds ?? []}
            renderItem={({item, index}) => (
              <ConsolidatedInvoiceItem
                key={index}
                invoiceNumber={item?.invoice_number}
                balance={item?.due_amount}
                date={item?.created_at}
                unit={item?.property_name}
                onPress={() => handleNavigate(item.id)}
              />
            )}
            estimatedItemSize={20}
          />
        </View>
      </CustomBottomSheet>
    );
  },
);

export default ConsolidatedInvoices;

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 10,
  },
});

export const renderSheetHeader = (
  title: string = 'Consolidated Invoices',
  handleClose: () => void,
) => (
  <View className={'border-b border-border_grey mx-5'}>
    <View
      className={
        'top-0 bg-none py-3 z-50 flex-row justify-between items-center'
      }>
      <Text className={'font-open-sauce-sans-semibold text-lg text-black'}>{title}</Text>

      <CButton
        ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
        onPress={handleClose}>
        {/* @ts-ignore */}
        <CloseSvg />
      </CButton>
    </View>
  </View>
);

interface IConsolidatedInvoiceItemProps extends TouchableOpacityProps {
  invoiceNumber: string;
  unit: string;
  balance: number;
  date: Date;
}

const ConsolidatedInvoiceItem = ({
  invoiceNumber,
  unit,
  balance,
  date,
  ...rest
}: IConsolidatedInvoiceItemProps) => (
  <TouchableOpacity
    className={
      'mb-4 flex-row space-x-3 pt-2 pb-3 border-b border-b-border_grey'
    }
    {...rest}>
    <View
      className={
        'items-center justify-center h-10 w-10 rounded-full bg-white overflow-hidden border border-border_grey'
      }>
      <InvoiceSvg size={24} />
    </View>

    <View className={'flex-1'}>
      <View className={'flex-row justify-between w-full'}>
        <Text className={` font-open-sauce-sans-medium text-xs ${'text-primary'}`}>
          {invoiceNumber}
        </Text>

        {date ? (
          <Text className={'font-open-sauce-sans text-2xs text-inactive_text'}>
            {moment(date).format('Do MMM YYYY')}
          </Text>
        ) : null}
      </View>

      <View className={'flex-row justify-between w-full mt-2'}>
        <Text className={'font-open-sauce-sans text-[11px] text-black'}>{unit}</Text>

        <View className={'flex-row'}>
          <Text className={'text-[#ED3776] font-open-sauce-sans-medium text-xs'}>
            Balance: KES. {balance}{' '}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);
