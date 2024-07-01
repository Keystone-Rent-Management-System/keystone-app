import React from 'react';
import {View} from 'react-native';
import {FlashList} from '@shopify/flash-list';

import {CInput, Layout} from '@/components';
import {SearchSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {invoiceStyles, renderInvoiceItem} from './Unpaid';
import {useNavigation} from '@react-navigation/native';
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
        keyExtractor={item => item?.id}
        estimatedItemSize={300}
        onRefresh={refetch}
      />
    </Layout>
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
