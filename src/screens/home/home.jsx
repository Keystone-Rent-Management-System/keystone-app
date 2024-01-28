import React from 'react';

import {
  HomeHeader,
  HomeApartmentTitle,
  Layout,
  HomeStatsCard,
  HomeMenu,
} from '@/components';

const Home = () => {
  return (
    <Layout ClassName={'px-4'}>
      {/* Header */}
      <HomeHeader />

      {/*apartment title */}
      <HomeApartmentTitle />

      {/* stats card */}
      <HomeStatsCard />

      {/* Finance & payments */}
      <HomeMenu />
    </Layout>
  );
};

export default Home;
