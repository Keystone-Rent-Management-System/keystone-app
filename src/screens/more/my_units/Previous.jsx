import React from 'react';
import moment from 'moment';
import {FlashList} from '@shopify/flash-list';

import {Layout} from '../../../components';
import {invoiceStyles} from '../../home/invoice/Unpaid';
import {renderUnitListItem} from './Current';
import {useNavigation} from '@react-navigation/native';

const Previous = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('my_units__view');
  };

  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={previousUnits}
        renderItem={({item}) => renderUnitListItem(item, handleNavigate)}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

const previousUnits = [
  {
    id: 1,
    title: 'Purple HazeApartment',
    fromDate: moment().subtract(3, 'M').format('MMM YY'),
    toDate: moment().format('MMM YY'),
    unitName: 'unit E304',
    amount: '110,000',
  },
  {
    id: 2,
    title: 'Ruaka Arcade Homes',
    fromDate: moment().subtract(12, 'M').format('MMM YY'),
    toDate: moment().format('MMM YY'),
    unitName: 'unit L202',
    amount: '80,000',
  },
];
export default Previous;
