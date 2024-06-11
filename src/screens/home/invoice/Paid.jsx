import React from 'react';
import {View} from 'react-native';
import {FlashList} from '@shopify/flash-list';

import {CInput, Layout, ListingItem} from '@/components';
import {SearchSvg} from '@/assets/icons';
import {InvoiceSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {invoiceStyles} from './Unpaid';
import {useNavigation} from '@react-navigation/native';
import numberWithCommas from '../../../utils/numberWithCommas';
import moment from 'moment';
import {usePaidInvoice} from '../../../hooks';

const Paid = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('invoice_view', {id});
  };

  const {isPending, invoices, refetch} = usePaidInvoice();

  return (
    <Layout>
      {/*  search input*/}

      <FlashList
        ListHeaderComponent={<Header />}
        contentContainerStyle={invoiceStyles.list}
        refreshing={isPending}
        data={invoices}
        renderItem={({item}) => renderInvoiceItem(item, handleNavigate)}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
        onRefresh={refetch}
      />
    </Layout>
  );
};

export const renderInvoiceItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<InvoiceSvg size={'24'} />}
      id={item?.id}
      title={item?.propertyName?.split('-')[0]}
      customDate={moment(item?.createdAt).format('Do MMM, YYYY')}
      unit={item?.propertyName?.split('-')[1]}
      amount={numberWithCommas(item?.paidAmount)}
      isPartial={item?.paidAmount && item?.paidAmount < item?.totalAmount}
      handlePress={() => handlePress(item?.id)}
    />
  );
};

const Header = () => (
  <CInput
    ClassName={'rounded-xl mb-3 overflow-hidden border-border_grey'}
    icon={
      <View className={'px-3 black my-auto flex items-center justify-center'}>
        <SearchSvg size={'18'} />
      </View>
    }
    InputClassName={'placeholder-grey_1 flex-1 p-2 px-0 font-inter text-xs'}
    placeHolder={'Search Apartment, Month'}
    placeholderTextColor={COLORS.inactive_text}
    showSoftInputOnFocus={false}
  />
);

export default Paid;
