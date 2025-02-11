import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {ToastAndroid, View} from 'react-native';

import {
  HomeApartmentTitle,
  HomeHeader,
  HomeMenu,
  HomeStatsCard,
  LandlordHomeRefetchCard,
  Layout,
} from '../../components';
import AgreementModalSheet from '../../components/modals/Agreement';
import {useActiveAgrement, useActiveStatement, useHelp} from '../../hooks';
import {useActiveAgreement} from '../../provider/store';
import {
  GeneralRepairsModal,
  GetHelpModal,
  MakeComplaintModal,
  PaymentAllocationModal,
  RequestExtensionModal,
  RequestRepairModal,
  StatementFilterModal,
} from '../../components/modals';

const Home = () => {
  const extensionModalRef = useRef();
  const statementFilterModalRef = useRef();

  const {
    getHelpRef,
    makeComplaintRef,
    requestRepairRef,
    generalAssistanceRef,
    paymentAllocationRef,
    handleCloseHelpModal,
    handleOpenHelpModal,
    handleMakeComplaint,
    handleRequestRepair,
    handlePaymentAllocation,
    handleGeneralAssistance,
    handleCloseMakeComplaintModal,
    handleCloseRequestRepairModal,
    handleCloseGeneralAssistanceModal,
    handleClosePaymentAllocationModal,
  } = useHelp();

  const handleOpenExtensionModal = useCallback(() => {
    extensionModalRef.current?.expand();
  }, []);

  const handleCloseExtensionModal = useCallback(() => {
    extensionModalRef.current?.close();
  }, []);

  const handleOpenStatementFilterModal = useCallback(() => {
    statementFilterModalRef.current?.expand();
  }, []);

  const handleCloseStatementFilterModal = useCallback(() => {
    statementFilterModalRef.current?.close();
  }, []);

  const {
    isPending,
    agreement,
    agreementRefetch,
    isFetching: isActiveAgreementFetching,
    isAgreed,
  } = useActiveAgrement();
  const {
    activeStatement,
    refetch,
    isFetching: isActiveStatementFetching,
  } = useActiveStatement();

  const {inactiveAgreement} = useActiveAgreement();
  const agreementModalRef = useRef();

  const hasInactiveAgreement = useMemo(
    () =>
      !agreement?.id &&
      inactiveAgreement?.id &&
      inactiveAgreement?.status?.toLocaleLowerCase() !== 'terminated',
    [agreement, inactiveAgreement],
  );

  const handleOpenAgreement = useCallback(() => {
    if (hasInactiveAgreement) {
      ToastAndroid.show('You need to accept the agreement', ToastAndroid.SHORT);
      agreementModalRef?.current?.present();
    }
  }, [hasInactiveAgreement]);

  useEffect(() => {
    if (hasInactiveAgreement) {
      handleOpenAgreement();
    }
  }, [handleOpenAgreement, hasInactiveAgreement]);

  return (
    <>
      <Layout isScrollable ClassName={'px-4'}>
        {/* Header */}
        <HomeHeader />
        {!isPending && isAgreed ? (
          <View>
            {/*apartment title */}
            <HomeApartmentTitle
              agreement={agreement}
              refetch={() => {
                agreementRefetch();
                refetch();
              }}
              isLoading={isActiveAgreementFetching || isActiveStatementFetching}
            />

            {/* stats card */}
            <HomeStatsCard statement={activeStatement} agreement={agreement} />
          </View>
        ) : (
          <LandlordHomeRefetchCard
            refetch={() => {
              agreementRefetch();
              refetch();
            }}
          />
        )}

        {/* Finance & payments */}
        <HomeMenu
          hasInactiveAgreement={hasInactiveAgreement}
          handleAcceptAgreement={handleOpenAgreement}
          handleOpenHelpModal={handleOpenHelpModal}
          handleOpenExtensionModal={handleOpenExtensionModal}
          handleOpenStatementFilterModal={handleOpenStatementFilterModal}
        />
      </Layout>

      <GetHelpModal
        ref={getHelpRef}
        handleCloseModal={handleCloseHelpModal}
        handleMakeComplaint={handleMakeComplaint}
        handleRequestRepair={handleRequestRepair}
        handleGeneralAssistance={handleGeneralAssistance}
        handlePaymentAllocation={handlePaymentAllocation}
        key={1}
      />
      <AgreementModalSheet
        agreement={inactiveAgreement}
        ref={agreementModalRef}
        type={'pending'}
      />
      <MakeComplaintModal
        ref={makeComplaintRef}
        handleCloseModal={handleCloseMakeComplaintModal}
        key={2}
      />

      <RequestRepairModal
        ref={requestRepairRef}
        handleCloseModal={handleCloseRequestRepairModal}
        key={3}
      />

      <GeneralRepairsModal
        ref={generalAssistanceRef}
        handleCloseModal={handleCloseGeneralAssistanceModal}
        key={4}
      />

      <RequestExtensionModal
        ref={extensionModalRef}
        handleCloseModal={handleCloseExtensionModal}
        key={5}
      />

      <PaymentAllocationModal
        ref={paymentAllocationRef}
        handleCloseModal={handleClosePaymentAllocationModal}
        key={6}
      />

      <StatementFilterModal
        handleCloseFilter={handleCloseStatementFilterModal}
        ref={statementFilterModalRef}
        key={7}
      />
    </>
  );
};

export default Home;
