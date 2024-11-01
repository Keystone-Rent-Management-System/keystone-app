import React from 'react';

import {
  HomeApartmentTitle,
  HomeHeader,
  HomeMenu,
  HomeStatsCard,
  LandlordHomeRefetchCard,
  Layout,
} from '../../components';
import {useActiveAgrement, useActiveStatement} from '../../hooks';
import {View} from 'react-native';

const Home = () => {
  const {isPending, agreement, agreementRefetch} = useActiveAgrement();
  const {activeStatement, refetch} = useActiveStatement();

  return (
    <Layout ClassName={'px-4'}>
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
      <HomeMenu />
    </Layout>
  );
};

export default Home;
