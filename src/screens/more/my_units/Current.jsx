import React from 'react';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment/moment';
import {FlashList} from '@shopify/flash-list';

import {Layout, ListingItem} from '@/components';
import {invoiceStyles} from '../../home/invoice/Unpaid';
import {HomeSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';

const Current = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('my_units__view');
  };

  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={currentUnits}
        renderItem={({item}) => renderUnitListItem(item, handleNavigate)}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export const renderUnitListItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<HomeSvg color={COLORS.primary} size={'24'} />}
      id={item?.id}
      title={item?.title}
      customDate={item?.fromDate + ' - ' + item?.toDate}
      unit={item?.unitName}
      amount={item?.amount}
      handlePress={handlePress}
    />
  );
};

const currentUnits = [
  {
    id: 1,
    title: 'Purple HazeApartment',
    fromDate: moment().subtract(2, 'M').format('MMM YY'),
    toDate: moment().format('MMM YY'),
    unitName: 'unit 04',
    amount: '30,000',
  },
  {
    id: 2,
    title: 'Ruaka Arcade Homes',
    fromDate: moment().subtract(10, 'M').format('MMM YY'),
    toDate: moment().format('MMM YY'),
    unitName: 'unit 512',
    amount: '20,000',
  },
];

export default Current;
