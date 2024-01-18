import React from 'react';
import {ExploreFilters, ExploreHeader, Layout} from '../../components';

const Explore = () => {
  return (
    <Layout>
      {/*Header*/}
      <ExploreHeader />

      {/*  Filters  */}
      <ExploreFilters />
    </Layout>
  );
};

export default Explore;
