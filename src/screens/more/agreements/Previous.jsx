import React, {useRef, useState} from 'react';
import {Layout, ListingItem} from '../../../components';
import {FlashList} from '@shopify/flash-list';
import {invoiceStyles} from '../../home/invoice/Unpaid';
import {AgreementSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
// import moment from 'moment/moment';
import AgreementModalSheet from '../../../components/modals/Agreement';
import {useAgrement} from '../../../hooks';
import moment from 'moment';

const Previous = () => {
  const agreementModalRef = useRef();
  const [agreement, setAgreement] = useState({});

  const handleViewAgreement = data => {
    setAgreement(data);
    agreementModalRef?.current?.present();
  };

  const {isPending, agreements, refetch} = useAgrement();

  const previousAgreements =
    !isPending &&
    agreements?.filter(
      previousAgreement =>
        previousAgreement?.status?.toLowerCase() === 'terminated',
    );

  return (
    <Layout>
      <AgreementModalSheet
        agreement={agreement}
        ref={agreementModalRef}
        type={'previous'}
      />

      <FlashList
        contentContainerStyle={invoiceStyles.list}
        refreshing={isPending}
        data={previousAgreements}
        renderItem={({item}) =>
          renderAgreementListItem(item, handleViewAgreement)
        }
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
        onRefresh={refetch}
      />
    </Layout>
  );
};

export const renderAgreementListItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<AgreementSvg color={COLORS.primary} size={'24'} />}
      id={item?.id}
      title={item?.propertyUnits?.property?.name}
      customDate={
        moment(item?.tenancyBeginningDate).format('Do MMM, YYYY') +
        ' - ' +
        moment(item?.terminatedOn).format('Do MMM, YYYY')
      }
      unit={item?.propertyUnits?.name}
      amount={item?.propertyUnits?.rent}
      handlePress={() => handlePress(item)}
    />
  );
};

export default Previous;
