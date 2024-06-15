import React from 'react';

import {
  HomeHeader,
  HomeApartmentTitle,
  Layout,
  HomeStatsCard,
  HomeMenu,
} from '@/components';
import {useActiveInvoices} from '../../hooks/useInvoice';
import {View} from 'react-native';

const Home = () => {
  const {activeInvoices, refetch} = useActiveInvoices();

  return (
    <Layout ClassName={'px-4'}>
      {/* Header */}
      <HomeHeader />
      {activeInvoices?.map((invoice, index) => (
        <View key={index}>
          {/*apartment title */}
          <HomeApartmentTitle invoice={invoice} refetch={refetch} />

          {/* stats card */}
          <HomeStatsCard invoice={invoice} />
        </View>
      ))}

      {/* Finance & payments */}
      <HomeMenu />
    </Layout>
  );
};

export default Home;
