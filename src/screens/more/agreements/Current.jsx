import React, {useRef, useState} from 'react';
// import moment from 'moment';
import {FlashList} from '@shopify/flash-list';

import {Layout, ListingItem} from '../../../components';
import {AgreementSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import {invoiceStyles} from '../../home/invoice/Unpaid';
import AgreementModalSheet from '../../../components/modals/Agreement';
import {MovingOutModal} from '../../../components/modals';
import {useHelp} from '../../../hooks';
import {useBottomSheetModal} from '@gorhom/bottom-sheet';
import {
  useAcceptAgrement,
  useAgrement,
  useTerminateAgrement,
} from '../../../hooks';
import moment from 'moment';

const Current = () => {
  const agreementModalRef = useRef();
  const [agreement, setAgreement] = useState({});
  const {dismiss} = useBottomSheetModal();
  const {movingOutRef, handleOpenMovingOutModal, handleCloseMovingOutModal} =
    useHelp();

  const handleOpenAgreement = data => {
    setAgreement(data);
    agreementModalRef?.current?.present();
  };

  const handleIssueTermination = () => {
    dismiss();
    handleOpenMovingOutModal();
  };

  const {isPending, agreements, refetch} = useAgrement();

  const currentAgreements =
    !isPending &&
    agreements?.filter(
      currentAgreement =>
        currentAgreement?.status?.toLowerCase() === 'active & agreed' ||
        currentAgreement?.status?.toLowerCase() === 'pending',
    );

  const {handleAcceptAgreement} = useAcceptAgrement(dismiss, refetch);
  const {handleTerminateAgreement} = useTerminateAgrement(dismiss, refetch);

  return (
    <>
      <AgreementModalSheet
        agreement={agreement}
        ref={agreementModalRef}
        type={
          agreement?.status?.toLowerCase() === 'pending' ? 'pending' : 'agreed'
        }
        handleIssueTermination={handleIssueTermination}
        handleAcceptAgreement={handleAcceptAgreement}
        handleTerminateAgreement={handleTerminateAgreement}
      />
      <Layout>
        <FlashList
          contentContainerStyle={invoiceStyles.list}
          refreshing={isPending}
          data={currentAgreements}
          renderItem={({item}) =>
            renderAgreementListItem(item, handleOpenAgreement)
          }
          keyExtractor={(_, ind) => ind.toString()}
          estimatedItemSize={300}
          onRefresh={refetch}
        />
      </Layout>

      <MovingOutModal
        ref={movingOutRef}
        handleCloseModal={handleCloseMovingOutModal}
      />
    </>
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
        'Current'
      }
      unit={item?.propertyUnits?.name}
      amount={item?.propertyUnits?.rent}
      handlePress={() => handlePress(item)}
    />
  );
};

export default Current;
