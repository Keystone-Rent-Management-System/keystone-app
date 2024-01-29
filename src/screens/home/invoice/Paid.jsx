import React from 'react';
import {View} from 'react-native';
import {FlashList} from '@shopify/flash-list';

import {Layout} from '@/components';
import invoiceData from '@/provider/invoice';
import {CInput} from '@/components';
import {SearchSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {invoiceStyles, renderInvoiceItem} from './Unpaid';

const Paid = props => {
  return (
    <Layout>
      {/*  search input*/}

      <FlashList
        ListHeaderComponent={<Header />}
        contentContainerStyle={invoiceStyles.list}
        data={invoiceData.paid}
        renderItem={renderInvoiceItem}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
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
    // onFocus={props.handleSearchFocus}
  />
);

export default Paid;
