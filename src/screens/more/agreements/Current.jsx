import React, {useCallback, useState} from 'react';
// import moment from 'moment';
import {FlashList} from '@shopify/flash-list';

import {Layout, ListingItem} from '../../../components';
import {AgreementSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import {invoiceStyles} from '../../tenant_home/invoice/Unpaid';
import {MovingOutModal} from '../../../components/modals';
import {useAgrement, useHelp} from '../../../hooks';
import moment from 'moment';
import AgreementModalSheet from '../../../components/modals/Agreement';

const Current = () => {
  const [agreement] = useState({});

  const {movingOutRef, handleCloseMovingOutModal} = useHelp();

  const {isPending, agreements, refetch} = useAgrement();

  const currentAgreements =
    !isPending &&
    agreements?.filter(
      currentAgreement =>
        currentAgreement?.status?.toLowerCase() === 'agreed' ||
        currentAgreement?.status?.toLowerCase() === 'accepted' ||
        currentAgreement?.status?.toLowerCase() === 'pending',
    );

  const renderAgreementItem = useCallback(
    item => (
      <AgreementModalSheet>
        <ListingItem
          key={item?.id}
          icon={<AgreementSvg color={COLORS.primary} size={'24'} />}
          id={item?.id}
          title={item?.propertyUnits?.property?.name}
          customDate={
            moment(item?.tenancyBeginningDate)?.format('Do MMMM, YYYY') +
            ' - ' +
            'Current'
          }
          unit={item?.propertyUnits?.name}
          amount={item?.propertyUnits?.rent}
          disabled={true}
        />
      </AgreementModalSheet>
    ),
    [],
  );

  return (
    <>
      <Layout>
        <FlashList
          contentContainerStyle={invoiceStyles.list}
          refreshing={isPending}
          data={currentAgreements}
          renderItem={({item}) => renderAgreementItem(item)}
          estimatedItemSize={300}
          onRefresh={refetch}
        />
      </Layout>

      <MovingOutModal
        ref={movingOutRef}
        agreement={agreement}
        handleCloseModal={handleCloseMovingOutModal}
      />
    </>
  );
};

export const renderAgreementListItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      key={item?.id}
      icon={<AgreementSvg color={COLORS.primary} size={'24'} />}
      id={item?.id}
      title={item?.propertyUnits?.property?.name}
      customDate={
        moment(item?.tenancyBeginningDate)?.format('Do MMMM, YYYY') +
        ' - ' +
        'Current'
      }
      unit={item?.propertyUnits?.name}
      amount={item?.propertyUnits?.rent}
      handlePress={() => handlePress(item)}
    />
  );
};

export default Current;
