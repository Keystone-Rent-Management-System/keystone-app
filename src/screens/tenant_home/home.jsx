import React, {useEffect, useRef} from 'react';
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
import {useActiveAgrement, useActiveStatement} from '../../hooks';
import {useActiveAgreement} from '../../provider/store';

const Home = () => {
  const {
    isPending,
    agreement,
    agreementRefetch,
    isFetching: isActiveAgreementFetching,
  } = useActiveAgrement();
  const {
    activeStatement,
    refetch,
    isFetching: isActiveStatementFetching,
  } = useActiveStatement();
  const {inactiveAgreement} = useActiveAgreement();
  const agreementModalRef = useRef();

  const handleOpenAgreement = () => {
    ToastAndroid.show('You need to accept the agreement', ToastAndroid.SHORT);
    agreementModalRef?.current?.present();
  };

  useEffect(() => {
    if (
      !agreement?.id &&
      inactiveAgreement?.id &&
      inactiveAgreement?.status?.toLocaleLowerCase() !== 'terminated'
    ) {
      handleOpenAgreement();
    }
  }, [agreement?.id, inactiveAgreement]);

  return (
    <>
      <Layout isScrollable ClassName={'px-4'}>
        {/* Header */}
        <HomeHeader />
        {!isPending && agreement ? (
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
          hasInactiveAgreement={!agreement?.id && inactiveAgreement?.id}
          handleAcceptAgreement={handleOpenAgreement}
        />
      </Layout>

      <AgreementModalSheet
        agreement={inactiveAgreement}
        ref={agreementModalRef}
        type={'pending'}
      />
    </>
  );
};

export default Home;
