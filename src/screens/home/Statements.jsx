import React, {useCallback, useRef, useState} from 'react';
import {Layout} from '@/components';
import {CButton, StatementItem} from '../../components';
import {FlatList, Text, View, ActivityIndicator} from 'react-native';
import {SelectorButton} from '../../components/screens/explore/RoomSelector';
import {StatementListSvg} from '../../assets/icons';
import COLORS from '../../constants/Theme';
import {
  ExportStatementModal,
  InvoiceReceiptModal,
} from '../../components/modals';
import {useStatement} from '../../hooks/useStatement';
import {SectionList} from 'react-native';
import moment from 'moment';
import numberWithCommas from '../../utils/numberWithCommas';

const Statements = () => {
  const receiptModalRef = useRef();
  const exportModalRef = useRef();

  const currentDate = new Date();

  const endDate = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;

  const [active] = useState(0);
  const [statement, setStatement] = useState(null);
  const [page, setPage] = useState(0);

  const {isPending, isRefetching, statements, totalPages, refetch} =
    useStatement(page);
  const handleLoadMore = () => {
    if (!isPending && totalPages > page + 1) {
      setPage(prev => prev + 1);
      refetch();
    }
  };

  const handleOpenReceiptModal = useCallback(current => {
    setStatement(current);
    receiptModalRef.current?.expand();
  }, []);

  const handleCloseReceiptModal = useCallback(() => {
    setStatement(null);
    receiptModalRef.current?.close();
  }, []);

  const handleOpenExportModal = useCallback(() => {
    exportModalRef.current?.expand();
  }, []);

  const handleCloseExportModal = useCallback(() => {
    exportModalRef.current?.close();
  }, []);

  const renderYears = ({item, index, isActive}) => {
    return (
      <SelectorButton
        key={index}
        ClassName={'py-0'}
        isActive={isActive}
        text={item}
      />
    );
  };
  return (
    <>
      <Layout ClassName={'p-4 relative'}>
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
        {!isPending && (
          <SectionList
            sections={statements}
            keyExtractor={item => item?.id}
            renderItem={({item}) => (
              <StatementItem
                title={'invoice'}
                date={moment(item?.transactionDate).format('Do, MMMM YYYY')}
                paymentMethod={item?.methodOfPayment}
                amount={numberWithCommas(item?.amountDebited)}
                handlePress={() => handleOpenReceiptModal(item)}
              />
            )}
            renderSectionHeader={renderHeader}
            refreshing={isPending}
            onRefresh={refetch}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isRefetching ? (
                <ActivityIndicator color={'#02237405'} size="large" />
              ) : null
            }
          />
        )}

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

      <InvoiceReceiptModal
        statement={statement}
        ref={receiptModalRef}
        handleCloseModal={handleCloseReceiptModal}
      />
      <ExportStatementModal
        ref={exportModalRef}
        handleCloseModal={handleCloseExportModal}
      />
    </>
  );
};

const renderHeader = ({section}) => (
  <View className={'pb-2 px-4 mt-3'}>
    <Text className={'font-inter-semibold text-grey_1 capitalize'}>
      {section?.month}
    </Text>
  </View>
);

export default Statements;

const years = ['All'];
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// const statements = [
//   {
//     month: 'January',
//     data: [
//       {
//         title: 'invoice #1234567',
//         date: moment().format('MMM YYYY'),
//         paymentMethod: 'Mpesa',
//         amount: '30,000',
//       },
//     ],
//   },

//   {
//     month: 'December',
//     data: [
//       {
//         title: 'invoice #1234567',
//         date: moment().subtract('1', 'm').format('MMM YYYY'),
//         paymentMethod: 'Bank',
//         amount: '30,000',
//       },
//     ],
//   },
//   {
//     month: 'November',
//     data: [
//       {
//         title: 'invoice #1234567',
//         date: moment().subtract('1', 'm').format('MMM YYYY'),
//         paymentMethod: 'Bank',
//         amount: '30,000',
//       },
//     ],
//   },
//   {
//     month: 'October',
//     data: [
//       {
//         title: 'invoice #1234567',
//         date: moment().subtract('1', 'm').format('MMM YYYY'),
//         paymentMethod: 'Bank',
//         amount: '30,000',
//       },
//     ],
//   },
//   {
//     month: 'September',
//     data: [
//       {
//         title: 'invoice #1234567',
//         date: moment().subtract('1', 'm').format('MMM YYYY'),
//         paymentMethod: 'Bank',
//         amount: '30,000',
//       },
//     ],
//   },
//   {
//     month: 'August',
//     data: [
//       {
//         title: 'invoice #1234567',
//         date: moment().subtract('1', 'm').format('MMM YYYY'),
//         paymentMethod: 'Bank',
//         amount: '30,000',
//       },
//     ],
//   },
//   {
//     month: 'July',
//     data: [
//       {
//         title: 'invoice #1234567',
//         date: moment().subtract('1', 'm').format('MMM YYYY'),
//         paymentMethod: 'Bank',
//         amount: '30,000',
//       },
//     ],
//   },
//   {
//     month: 'June',
//     data: [
//       {
//         title: 'invoice #1234567',
//         date: moment().subtract('1', 'm').format('MMM YYYY'),
//         paymentMethod: 'Bank',
//         amount: '30,000',
//       },
//     ],
//   },
//   {
//     month: 'May',
//     data: [
//       {
//         title: 'invoice #1234567',
//         date: moment().subtract('1', 'm').format('MMM YYYY'),
//         paymentMethod: 'Bank',
//         amount: '30,000',
//       },
//     ],
//   },
// ];
