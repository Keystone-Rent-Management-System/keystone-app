import React, {useCallback, useRef, useState} from 'react';
// import moment from 'moment';
import {FlashList} from '@shopify/flash-list';

import {Layout, ListingItem} from '../../../components';
import {AgreementSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import {invoiceStyles} from '../../tenant_home/invoice/Unpaid';
import {MovingOutModal} from '../../../components/modals';
import {useAcceptAgrement, useAgrement} from '../../../hooks';
import moment from 'moment';
import AgreementModalSheet from '../../../components/modals/Agreement';
import {useBottomSheetModal} from '@gorhom/bottom-sheet';

const Current = () => {
  const agreementModalRef = useRef();
  const movingOutRef = useRef();

  const [agreement, setAgreement] = useState({});
  const {dismiss} = useBottomSheetModal();

  const {isPending, agreements, refetch} = useAgrement();
  const {acceptAgrementMutation, handleAcceptAgreement} = useAcceptAgrement(
    dismiss,
    refetch,
  );

  const handleOpenMovingOutModal = useCallback(() => {
    movingOutRef.current?.expand();
  }, []);

  const handleCloseMovingOutModal = useCallback(() => {
    movingOutRef.current?.close();
  }, []);

  const handleIssueTermination = useCallback(
    agreementId => {
      setAgreement(agreementId);
      handleOpenMovingOutModal();
      dismiss();
    },
    [dismiss, handleOpenMovingOutModal],
  );

  const currentAgreements = isPending
    ? []
    : agreements?.filter(
        currentAgreement =>
          currentAgreement?.status?.toLowerCase() === 'agreed' ||
          currentAgreement?.status?.toLowerCase() === 'accepted' ||
          currentAgreement?.status?.toLowerCase() === 'pending',
      );

  const renderAgreementItem = useCallback(
    item => {
      return (
        <AgreementModalSheet
          agreement={item}
          ref={agreementModalRef}
          type={
            item?.status?.toLowerCase() === 'pending' ? 'pending' : 'agreed'
          }
          handleIssueTermination={() => handleIssueTermination(item?.id)}
          handleAcceptAgreement={handleAcceptAgreement}
          acceptAgrementMutation={acceptAgrementMutation}>
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
      );
    },
    [acceptAgrementMutation, handleAcceptAgreement, handleIssueTermination],
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
        agreement={currentAgreements?.find(agr => agr.id === agreement)}
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
