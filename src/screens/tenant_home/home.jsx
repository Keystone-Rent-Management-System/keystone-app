import React from 'react';

import {
  HomeHeader,
  HomeApartmentTitle,
  Layout,
  HomeStatsCard,
  HomeMenu,
  LandlordHomeRefetchCard,
} from '@/components';
import {useActiveInvoices} from '../../hooks/useInvoice';
import {View} from 'react-native';

const Home = () => {
  const {activeInvoices, refetch} = useActiveInvoices();

  return (
    <Layout ClassName={'px-4'}>
      {/* Header */}
      <HomeHeader />
      {activeInvoices?.length > 0 ? (
        activeInvoices?.map((invoice, index) => (
          <View key={index}>
            {/*apartment title */}
            <HomeApartmentTitle invoice={invoice} refetch={refetch} />

            {/* stats card */}
            <HomeStatsCard invoice={invoice} />
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
