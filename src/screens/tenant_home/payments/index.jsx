import React, {useCallback, useState} from 'react';
import {Layout} from '@/components';
import {ActivityIndicator, SectionList, Text, View} from 'react-native';
import numberWithCommas from '../../../utils/numberWithCommas';
import moment from 'moment';
import {BillsSvg} from '@/assets/icons';
import {EmptyInvoiceList, PaymentItem} from '../../../components';
import {useTenantTransaction} from '../../../hooks';
import {useNavigation} from '@react-navigation/native';

const Index = () => {
  const [size, setSize] = useState(20);
  const navigation = useNavigation();

  const {isPending, isRefetching, transactions, totalElements, refetch} =
    useTenantTransaction(size);

  const handleLoadMore = () => {
    if (!isPending && totalElements > size) {
      setSize(prev => prev + 10);
      refetch();
    }
  };

  const handleViewPayment = useCallback(
    item => {
      navigation.navigate('payment_receipt', {payment: item});
    },
    [navigation],
  );

  return (
    <>
      <Layout ClassName={'p-4 relative'}>
        <SectionList
          sections={transactions}
          keyExtractor={item => item?.id}
          estimatedItemSize={20}
          renderItem={props => renderItem(props, handleViewPayment)}
          renderSectionHeader={renderHeader}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isPending ? (
              <ActivityIndicator color={'#022374'} size="large" />
            ) : null
          }
          ListEmptyComponent={renderEmptyPayment}
        />
      </Layout>
    </>
  );
};

const renderItem = ({item}, handlePress) => (
  <PaymentItem
    icon={
      <View className={'px-3 black my-auto flex items-center justify-center'}>
        <BillsSvg size={'18'} />
      </View>
    }
    transactionCode={item?.transactionCode}
    date={moment(item?.createdAt)?.format('Do MMMM, YYYY')}
    paymentMethod={item?.methodOfPayment}
    amount={numberWithCommas(Number(item.amountDebited))}
    invoiceNumber={item?.invoiceNumber}
    handlePress={() => handlePress(item)}
  />
);

const renderHeader = ({section}) => (
  <View className={'pb-2 px-4 mt-3'}>
    <Text className={'font-inter-semibold text-grey_1 capitalize'}>
      {section?.month}
    </Text>
  </View>
);

export default Index;

const renderEmptyPayment = () => (
  <EmptyInvoiceList
    title={'No Index Found!'}
    subTitle={'You haven’t made any transaction yet.'}
  />
);
