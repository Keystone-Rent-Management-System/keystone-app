import React, {useCallback, useRef, useState} from 'react';
import {Layout} from '@/components';
import {CButton, StatementItem} from '../../components';
import {Text, View, ActivityIndicator, StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {StatementListSvg} from '../../assets/icons';
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

  // const renderYears = ({item, index, isActive}) => {
  //   return (
  //     <SelectorButton
  //       key={index}
  //       ClassName={'py-0'}
  //       isActive={isActive}
  //       text={item}
  //       handlePress={() => {
  //         setActive(index);
  //       }}
  //     />
  //   );
  // };

  const handleNavigate = () => {
    console.log('naviagate');
  };

  return (
    <>
      <Layout>
        <FlashList
          ListHeaderComponent={<Header />}
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
      {/* <Layout ClassName={'p-4 relative'}>
        <View>
          <FlatList
            className={'h-8'}
            data={years}
            renderItem={({item, index}) =>
              renderYears({
                item,
                index,
                isActive: active === index,
              })
            }
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <SectionList
          sections={statements}
          keyExtractor={item => item?.id}
          estimatedItemSize={20}
          renderItem={renderItem}
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
      </Layout> */}

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
    date={moment(item?.createdAt)?.format('Do MMMM, YYYY')}
    title={
      item?.invoiceNumber
        ? `Invoice no: ${item?.invoiceNumber}`
        : `Transaction: ${item?.transactionCode}`
    }
    charge={`KES. ${numberWithCommas(Number(100))}`}
    paidAmount={`KES. ${numberWithCommas(Number(100))}`}
    balance={`KES. ${numberWithCommas(Number(100))}`}
    handlePress={handlePress}
  />
);

const Header = () => (
  <View
    className={'pb-2 px-1 flex flex-row justify-between items-center border-b'}>
    <View>
      <Text className={'font-inter-semibold text-grey_1 capitalize'}>Date</Text>
    </View>
    <View>
      <Text className={'font-inter-semibold text-grey_1 capitalize text-xs'}>
        Details
      </Text>
    </View>
    <View>
      <Text className={'font-inter-semibold text-grey_1 capitalize text-xs'}>
        Charges
      </Text>
    </View>
    <View>
      <Text className={'font-inter-semibold text-grey_1 capitalize text-xs'}>
        Payments
      </Text>
    </View>
    <View>
      <Text className={'font-inter-semibold text-grey_1 capitalize text-xs'}>
        Balance
      </Text>
    </View>
  </View>
);

export const statementStyles = StyleSheet.create({
  list: {
    padding: 16,
  },
});

export default Statements;
