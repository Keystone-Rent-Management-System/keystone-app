import React from 'react';

import {HomeHeader, HomeApartmentTitle, Layout} from '@/components';

const Home = () => {
  return (
    <Layout ClassName={'px-4'}>
      {/* Header */}
      <HomeHeader />

      {/*apartment title */}
      <HomeApartmentTitle />
    </Layout>
  );
};

export default Home;
