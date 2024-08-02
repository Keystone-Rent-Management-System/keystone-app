import React from 'react';

import {
  HomeHeader,
  HomeApartmentTitle,
  Layout,
  HomeStatsCard,
  HomeMenu,
  LandlordHomeRefetchCard,
} from '@/components';
import {useActiveInvoices} from '../../hooks';
import {View} from 'react-native';
import {useActiveAgrement} from '../../hooks';

const Home = () => {
  const {activeInvoices, refetch} = useActiveInvoices();
  const {isPending, agreement} = useActiveAgrement();

  return (
    <Layout ClassName={'px-4'}>
      {/* Header */}
      <HomeHeader />
      {!isPending && agreement ? (
        activeInvoices?.map((invoice, index) => (
          <View key={index}>
            {/*apartment title */}
            <HomeApartmentTitle invoice={invoice} refetch={refetch} />

            {/* stats card */}
            <HomeStatsCard invoice={invoice} agreement={agreement} />
          </View>
        ))
      ) : (
        <LandlordHomeRefetchCard refetch={refetch} />
      )}

      {/* Finance & payments */}
      <HomeMenu />
    </Layout>
  );
};

export default Home;
