import React, {useCallback, useRef, useState} from 'react';
import {Layout} from '@/components';
import {CButton, StatementItem} from '../../components';
import {FlatList, Text, View} from 'react-native';
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

const Statements = () => {
  const receiptModalRef = useRef();

  const currentDate = new Date();

  const endDate = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;

  const {isPending, statements, refetch} = useStatement();
  console.log(statements);

  const [active] = useState(0);

  const handleCloseReceiptModal = useCallback(() => {
    receiptModalRef.current?.close();
  }, []);

  const handleOpenExportModal = useCallback(() => {
    receiptModalRef.current?.expand();
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
            renderItem={renderItem}
            renderSectionHeader={renderHeader}
            refreshing={isPending}
            onRefresh={refetch}
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
        ref={receiptModalRef}
        handleCloseModal={handleCloseReceiptModal}
      />
      <ExportStatementModal
        ref={receiptModalRef}
        handleCloseModal={handleCloseReceiptModal}
      />
    </>
  );
};

const renderItem = ({item}, handlePress) => (
  <StatementItem
    title={`invoice ${item?.transactionCode}`}
    date={moment(item?.transactionDate).format('Do, MMM YYYY')}
    paymentMethod={item?.methodOfPayment}
    amount={item?.amountDebited}
    handlePress={handlePress}
  />
);

const renderHeader = ({section}) => (
  <View className={'pb-2 px-4 mt-3'}>
    <Text className={'font-inter-semibold text-grey_1 capitalize'}>
      {months[new Date(section?.transactionDate)?.getMonth()]}
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
