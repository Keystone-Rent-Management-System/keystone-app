import React, {useRef} from 'react';
import moment from 'moment';
import {FlashList} from '@shopify/flash-list';

import {Layout, ListingItem} from '../../../components';
import {AgreementSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import {invoiceStyles} from '../../home/invoice/Unpaid';
import AgreementModalSheet from '../../../components/modals/Agreement';

const Current = () => {
  const agreementModalRef = useRef();

  const handleOpenAgreement = () => {
    agreementModalRef?.current?.present();
  };

  return (
    <>
      <AgreementModalSheet ref={agreementModalRef} />
      <Layout>
        <FlashList
          contentContainerStyle={invoiceStyles.list}
          data={currentAgreements}
          renderItem={({item}) =>
            renderAgreementListItem(item, handleOpenAgreement)
          }
          keyExtractor={(_, ind) => ind.toString()}
          estimatedItemSize={300}
        />
      </Layout>
    </>
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
