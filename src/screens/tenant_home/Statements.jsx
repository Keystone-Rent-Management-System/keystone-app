import React, {useCallback, useRef, useState} from 'react';
import {Layout} from '@/components';
import {CButton, StatementItem} from '../../components';
import {Text, View, ActivityIndicator, StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {StatementListSvg, StatementsSvg} from '../../assets/icons';
import COLORS from '../../constants/Theme';
import {ExportStatementModal} from '../../components/modals';
import moment from 'moment';
import numberWithCommas from '../../utils/numberWithCommas';
import {useStatement} from '../../hooks';

const Statements = () => {
  const exportModalRef = useRef();
  const dateModalRef = useRef();

  const [size, setSize] = useState(20);

  const {isPending, isRefetching, statements, totalElements, refetch} =
    useStatement(size);

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

  const handleOpenDateModal = useCallback(() => {
    dateModalRef.current?.expand();
  }, []);

  const handleNavigate = () => {
    console.log('naviagate');
  };

  return (
    <>
      <Layout>
        <FlashList
          contentContainerStyle={statementStyles.list}
          refreshing={isPending || isRefetching}
          data={statements}
          renderItem={({item}) => renderItem(item, handleNavigate)}
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
        dateModalRef={dateModalRef}
        handleCloseModal={handleCloseExportModal}
        handleOpenDateModal={handleOpenDateModal}
      />
    </>
  );
};

const renderItem = (item, handlePress = () => {}) => (
  <StatementItem
    icon={
      <View className={'px-3 black my-auto flex items-center justify-center'}>
        <StatementsSvg size={'18'} />
      </View>
    }
    details={[
      {
        key: 'Date',
        value: moment(item?.createdAt)?.format('Do MMMM, YYYY'),
      },
      {
        key: 'Details',
        value: item?.payement
          ? `Transaction: ${item?.transactionCode}`
          : `Invoice no: ${item?.invoiceNumber}`,
      },
      {
        key: 'Charges',
        value: `KES. ${numberWithCommas(Number(100))}`,
      },
      {
        key: 'Payments',
        value: `KES. ${numberWithCommas(Number(100))}`,
      },
      {
        key: 'Balance',
        value: `KES. ${numberWithCommas(Number(100))}`,
      },
    ]}
    handlePress={handlePress}
  />
);

// const Header = () => (
//   <View
//     className={'pb-2 px-1 flex flex-row justify-between items-center border-b'}>
//     <View>
//       <Text className={'font-inter-semibold text-grey_1 capitalize'}>Date</Text>
//     </View>
//     <View>
//       <Text className={'font-inter-semibold text-grey_1 capitalize text-xs'}>
//         Details
//       </Text>
//     </View>
//     <View>
//       <Text className={'font-inter-semibold text-grey_1 capitalize text-xs'}>
//         Charges
//       </Text>
//     </View>
//     <View>
//       <Text className={'font-inter-semibold text-grey_1 capitalize text-xs'}>
//         Payments
//       </Text>
//     </View>
//     <View>
//       <Text className={'font-inter-semibold text-grey_1 capitalize text-xs'}>
//         Balance
//       </Text>
//     </View>
//   </View>
// );

export const statementStyles = StyleSheet.create({
  list: {
    padding: 16,
  },
});

export default Statements;
