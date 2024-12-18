import React, {useCallback, useRef} from 'react';
import {StatementItem} from '../../components';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {ExportStatementModal} from '../../components/modals';
import {useStatement} from '../../hooks';
import Layout from '../../components/Layout';
import {useActiveStatement} from '../../hooks/useStatement';
import numberConverter from '../../utils/numberConverter';

const Statements = () => {
  const exportModalRef = useRef();
  const dateModalRef = useRef();

  const {
    isPending,
    statements,
    refetch,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    renderListFooter,
  } = useStatement();

  const {isPending: isPendingActive, activeStatement} = useActiveStatement();

  const handleLoadMore = useCallback(async () => {
    if (!isRefetching && !isFetchingNextPage && hasNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching]);

  const handleCloseExportModal = useCallback(() => {
    exportModalRef.current?.close();
  }, []);

  const handleOpenDateModal = useCallback(() => {
    dateModalRef.current?.expand();
  }, []);

  return (
    <>
      <Layout>
        <View
          className={'flex flex-row justify-between px-5 pt-3'}
          style={{gap: 15}}>
          {/*  Opening Balance m*/}
          <BalanceDisplayItem
            loading={isPendingActive}
            title={'Opening Balance'}
            value={activeStatement?.startingBalance?.toString()}
          />
          {/*  Closing Balance  */}
          <BalanceDisplayItem
            loading={isPendingActive}
            title={'Closing Balance'}
            value={numberConverter(activeStatement?.endingBalance)}
          />
        </View>

        <View className={'flex-row px-5 pt-3'}>
          <View className={'h-5 rounded-full w-1 bg-primary mr-2'} />
          <Text className={'text-gray-700 font-inter-semibold text-sm '}>
            Statement List
          </Text>
        </View>

        <FlashList
          contentContainerStyle={statementStyles.list}
          refreshing={isPending}
          data={statements}
          renderItem={({item}) => renderItem(item)}
          estimatedItemSize={100}
          onRefresh={refetch}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={2}
          ListFooterComponent={renderListFooter}
        />
      </Layout>

      <ExportStatementModal
        ref={exportModalRef}
        dateModalRef={dateModalRef}
        handleCloseModal={handleCloseExportModal}
        handleOpenDateModal={handleOpenDateModal}
      />
    </>
  );
};

const renderItem = (item, handlePress = () => {}) => (
  <StatementItem
    key={item?.id}
    invoiceNumber={
      item?.payment
        ? `Transaction: ${item?.payment?.transactions?.transactionCode}`
        : `Invoice ${item?.invoices?.invoiceNumber}`
    }
    date={item?.createdAt}
    startingBalance={numberConverter(item?.startingBalance) ?? 0}
    paymentAmount={numberConverter(item?.endingBalance) ?? 0}
  />
);

export const statementStyles = StyleSheet.create({
  list: {
    padding: 16,
    paddingTop: 0,
  },
});

const BalanceDisplayItem = ({title, value, loading}) => (
  <View
    style={{
      elevation: 1,
      shadowColor: '#000',
      zIndex: 1,
    }}
    className={
      'rounded-xl flex-1 h-24 bg-white p-3 items-center justify-center'
    }>
    {/*title*/}
    <Text className={'text-black font-inter text-xs mb-2'}>{title}</Text>
    {loading ? (
      <ActivityIndicator color={'#022374'} size="small" />
    ) : (
      <Text className={'text-black font-inter-semibold text-base'}>
        ksh. {value}
      </Text>
    )}
  </View>
);

export default Statements;
