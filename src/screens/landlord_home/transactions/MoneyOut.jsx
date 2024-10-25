import React, {useCallback, useRef, useState} from 'react';
import {CButton, Layout, StatementItem} from '../../../components';
import moment from 'moment';
import numberWithCommas from '../../../utils/numberWithCommas';
import {ActivityIndicator, SectionList} from 'react-native';
import {StatementListSvg} from '../../../assets/icons';
import {Text} from 'react-native-svg';
import {ExportStatementModal} from '../../../components/modals';
import COLORS from '../../../constants/Theme';
import {renderHeader, renderMoneyItem} from './MoneyIn';
import {useTransactionOut} from '../../../hooks/useTransaction';

const MoneyOut = () => {
  const exportModalRef = useRef();

  const [size, setSize] = useState(20);

  const {isPending, isRefetching, transactions, totalElements, refetch} =
    useTransactionOut(size);
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

        <CButton
          style={{elevation: 2}}
          ClassName={
            'absolute bg-primary_bg_pale rounded-full flex-row space-x-1 shadow-md bottom-3 right-3'
          }
          onPress={handleOpenExportModal}>
          <StatementListSvg h={'20'} color={COLORS.primary} />

          <Text className={'text-primary text-xs font-inter-medium'}>
            Export Statement
          </Text>
        </CButton>
      </Layout>

      <ExportStatementModal
        ref={exportModalRef}
        handleCloseModal={handleCloseExportModal}
      />
    </>
  );
};

const renderItem = ({item}, handlePress) => (
  <StatementItem
    title={`Transaction code: ${item?.transactionCode}`}
    date={moment(item?.createdAt)?.format('Do MMMM, YYYY')}
    paymentMethod={item?.methodOfPayment}
    amount={numberWithCommas(Number(item.amountCredited))}
    handlePress={handlePress}
  />
);

export default MoneyOut;
