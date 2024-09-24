import React, {useCallback, useRef} from 'react';
import {StatementItem} from '../../components';
import {StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {ExportStatementModal} from '../../components/modals';
import {useStatement} from '../../hooks';
import Layout from '../../components/Layout';

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
        ? `Transaction: ${item?.transactionCode}`
        : `Invoice ${item?.invoices?.invoiceNumber}`
    }
    date={item?.createdAt}
    charge={item?.payment ?? 0}
    paymentAmount={item?.endingBalance ?? 0}
  />
);

export const statementStyles = StyleSheet.create({
  list: {
    padding: 16,
    paddingTop: 0,
  },
});

export default Statements;
