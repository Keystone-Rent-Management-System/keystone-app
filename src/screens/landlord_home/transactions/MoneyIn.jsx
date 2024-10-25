import React, {useCallback, useRef, useState} from 'react';
import {Layout, StatementItem} from '../../../components';
import {ActivityIndicator, SectionList, Text, View} from 'react-native';
import {useTransactionIn} from '../../../hooks/useTransaction';

const MoneyIn = () => {
  const exportModalRef = useRef();

  const [size, setSize] = useState(20);

  const {isPending, isRefetching, transactions, totalElements, refetch} =
    useTransactionIn(size);
  const handleLoadMore = () => {
    if (!isPending && !isRefetching && totalElements > size) {
      setSize(prev => prev + 10);
      refetch();
    }
  };

  const handleOpenExportModal = useCallback(() => {
    exportModalRef.current?.expand();
  }, []);

  const handleCloseExportModal = useCallback(() => {
    exportModalRef.current?.close();
  }, []);

  console.log('DATA IS::', transactions);

  return (
    <>
      <Layout ClassName={'p-4 relative'}>
        <SectionList
          sections={transactions}
          keyExtractor={item => item?.id}
          estimatedItemSize={20}
          renderItem={renderMoneyItem}
          renderSectionHeader={renderHeader}
          refreshing={isPending || isRefetching}
          onRefresh={refetch}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isRefetching ? (
              <ActivityIndicator color={'#022374'} size="large" />
            ) : null
          }
        />

        {/*<CButton*/}
        {/*  style={{elevation: 2}}*/}
        {/*  ClassName={*/}
        {/*    'absolute bg-primary_bg_pale rounded-full flex-row space-x-1 shadow-md bottom-3 right-3'*/}
        {/*  }*/}
        {/*  onPress={handleOpenExportModal}>*/}
        {/*  <StatementListSvg h={'20'} color={COLORS.primary} />*/}

        {/*  <Text className={'text-primary text-xs font-inter-medium'}>*/}
        {/*    Export Statement*/}
        {/*  </Text>*/}
        {/*</CButton>*/}
      </Layout>

      {/*<ExportStatementModal*/}
      {/*  ref={exportModalRef}*/}
      {/*  handleCloseModal={handleCloseExportModal}*/}
      {/*/>*/}
    </>
  );
};

export const renderMoneyItem = ({item}, handlePress) => {
  return (
    <StatementItem
      invoiceNumber={
        item?.transactionCode
          ? ` ${item?.transactionCode}`
          : `Invoice ${item?.invoiceNumber}`
      }
      date={item?.createdAt}
      startingBalance={null}
      paymentAmount={item?.amountDebited ?? 0}
    />
  );
};

export const renderHeader = ({section}) => (
  <View className={'pb-2 px-4 mt-3'}>
    <Text className={'font-inter-semibold text-grey_1 capitalize'}>
      {section?.month}
    </Text>
  </View>
);

export default MoneyIn;
