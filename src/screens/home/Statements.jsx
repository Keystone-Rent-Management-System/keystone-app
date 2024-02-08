import React, {useState} from 'react';
import {Layout} from '@/components';
import {CButton, StatementItem} from '../../components';
import {FlatList, SectionList, Text, View} from 'react-native';
import moment from 'moment';
import {SelectorButton} from '../../components/screens/explore/RoomSelector';
import {StatementListSvg} from '../../assets/icons';
import COLORS from '../../constants/Theme';

const Statements = () => {
  const [active] = useState(0);
  const renderYears = ({item, index, isActive}) => {
    return (
      <SelectorButton ClassName={'py-0'} isActive={isActive} text={item} />
    );
  };
  return (
    <Layout ClassName={'p-4 relative'}>
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

      <SectionList
        sections={statements}
        renderItem={renderItem}
        renderSectionHeader={renderHeader}
      />

      <CButton
        style={{elevation: 2}}
        ClassName={
          'absolute bg-primary_bg_pale rounded-full flex-row space-x-1 shadow-md bottom-3 right-3'
        }>
        <StatementListSvg h={'20'} color={COLORS.primary} />

        <Text className={'text-primary text-xs font-inter-medium'}>
          Export Statement
        </Text>
      </CButton>
    </Layout>
  );
};

const renderItem = ({item}) => (
  <StatementItem
    title={item?.title}
    date={item?.date}
    paymentMethod={item?.paymentMethod}
    amount={item.amount}
  />
);

const renderHeader = ({section}) => (
  <View className={'pb-2 px-4 mt-3'}>
    <Text className={'font-inter-semibold text-grey_1 capitalize'}>
      {section.month}
    </Text>
  </View>
);

export default Statements;

const years = ['All', '2024', '2023', '2022', '2021'];

const statements = [
  {
    month: 'January',
    data: [
      {
        title: 'invoice #1234567',
        date: moment().format('MMM YYYY'),
        paymentMethod: 'Mpesa',
        amount: '30,000',
      },
    ],
  },

  {
    month: 'December',
    data: [
      {
        title: 'invoice #1234567',
        date: moment().subtract('1', 'm').format('MMM YYYY'),
        paymentMethod: 'Bank',
        amount: '30,000',
      },
    ],
  },
  {
    month: 'November',
    data: [
      {
        title: 'invoice #1234567',
        date: moment().subtract('1', 'm').format('MMM YYYY'),
        paymentMethod: 'Bank',
        amount: '30,000',
      },
    ],
  },
  {
    month: 'October',
    data: [
      {
        title: 'invoice #1234567',
        date: moment().subtract('1', 'm').format('MMM YYYY'),
        paymentMethod: 'Bank',
        amount: '30,000',
      },
    ],
  },
  {
    month: 'September',
    data: [
      {
        title: 'invoice #1234567',
        date: moment().subtract('1', 'm').format('MMM YYYY'),
        paymentMethod: 'Bank',
        amount: '30,000',
      },
    ],
  },
  {
    month: 'August',
    data: [
      {
        title: 'invoice #1234567',
        date: moment().subtract('1', 'm').format('MMM YYYY'),
        paymentMethod: 'Bank',
        amount: '30,000',
      },
    ],
  },
  {
    month: 'July',
    data: [
      {
        title: 'invoice #1234567',
        date: moment().subtract('1', 'm').format('MMM YYYY'),
        paymentMethod: 'Bank',
        amount: '30,000',
      },
    ],
  },
  {
    month: 'June',
    data: [
      {
        title: 'invoice #1234567',
        date: moment().subtract('1', 'm').format('MMM YYYY'),
        paymentMethod: 'Bank',
        amount: '30,000',
      },
    ],
  },
  {
    month: 'May',
    data: [
      {
        title: 'invoice #1234567',
        date: moment().subtract('1', 'm').format('MMM YYYY'),
        paymentMethod: 'Bank',
        amount: '30,000',
      },
    ],
  },
];
