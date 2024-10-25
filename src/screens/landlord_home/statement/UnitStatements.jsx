import React, {useCallback, useRef, useState} from 'react';
import {LandlordStatementItem, Layout} from '@/components';
import {ActivityIndicator} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import numberWithCommas from '../../../utils/numberWithCommas';
import {useUnitInvoiceAnalytics} from '../../../hooks';
import {propertyStyles} from './PropertyStatements';
import {ExportStatementModal} from '../../../components/modals';

const UnitStatements = ({route: {params}}) => {
  const exportModalRef = useRef();
  const [size, setSize] = useState(20);

  const {isPending, statements, totalElements, isRefetching, refetch} =
    useUnitInvoiceAnalytics(size, params.unitName);

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
      <Layout ClassName={'px-4 relative'}>
        <FlashList
          contentContainerStyle={propertyStyles.list}
          refreshing={isPending || isRefetching}
          data={statements}
          renderItem={({item}) => renderStatementItem(item)}
          keyExtractor={item => item?.id}
          estimatedItemSize={20}
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

      <ExportStatementModal
        ref={exportModalRef}
        handleCloseModal={handleCloseExportModal}
      />
    </>
  );
};

export const renderStatementItem = item => {
  return (
    <LandlordStatementItem
      title={item?.billedTo}
      date={moment(item?.updatedAt)?.format('Do MMMM, YYYY')}
      billAmount={numberWithCommas(Number(item?.totalAmount ?? 0))}
      collectAmount={numberWithCommas(Number(item?.paidAmount ?? 0))}
      overPaid={
        item?.paidAmount > item?.totalAmount
          ? numberWithCommas(Number(-item?.dueAmount ?? 0))
          : 0
      }
      unCollectAmount={
        item?.paidAmount < item?.totalAmount
          ? numberWithCommas(Number(item?.dueAmount ?? 0))
          : item?.dueAmount === item?.totalAmount
          ? numberWithCommas(Number(item?.dueAmount ?? 0))
          : 0
      }
    />
  );
};

export default UnitStatements;
