import React from 'react';

import {
  Layout,
  HomeHeader,
  LandlordHomeRefetchCard,
  LandlordHomeStatsCard,
  LandlordHomeMenu,
} from '@/components';
import {View} from 'react-native';
import {useTotalTransaction} from '../../hooks';

const Home = () => {
  const {isPending, totals, refetch} = useTotalTransaction();
  return (
    <Layout ClassName={'px-4'}>
      {/* Header */}
      <HomeHeader />
      <View>
        {/*refetch balances */}
        <LandlordHomeRefetchCard refetch={refetch} />

        {/* stats card */}
        <LandlordHomeStatsCard isPending={isPending} totals={totals} />
      </View>

      {/* Finance & payments */}
      <LandlordHomeMenu />
    </Layout>
  );
};

export default Home;
