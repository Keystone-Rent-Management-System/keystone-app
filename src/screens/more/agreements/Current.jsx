import React from 'react';
import moment from 'moment';
import {Layout, ListingItem} from '../../../components';
import {AgreementSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import {FlashList} from '@shopify/flash-list';
import {invoiceStyles} from '../../home/invoice/Unpaid';

const Current = () => {
  const handleViewAgreement = () => {};

  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={currentAgreements}
        renderItem={({item}) =>
          renderAgreementListItem(item, handleViewAgreement)
        }
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export const renderAgreementListItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<AgreementSvg color={COLORS.primary} size={'24'} />}
      id={item?.id}
      title={item?.title}
      customDate={item?.fromDate + ' - ' + item?.toDate}
      unit={item?.unitName}
      amount={item?.amount}
      handlePress={handlePress}
    />
  );
};

const currentAgreements = [
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
