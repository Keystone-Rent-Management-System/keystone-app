import React from 'react';

import {
  HomeHeader,
  HomeApartmentTitle,
  Layout,
  HomeStatsCard,
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
    </Layout>
  );
};

export default Home;
