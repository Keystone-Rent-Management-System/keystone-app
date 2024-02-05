import React, {useCallback, useRef, useState} from 'react';
import {FlashList} from '@shopify/flash-list';

import {
  ExploreFilters,
  ExploreHeader,
  ExploreListingItem,
  ExploreMapView,
  ExplorerMapBtn,
  Layout,
} from '@/components';
import listings from '@/provider/listings';
import {ExplorerFilterModal} from '@/components/modals';
import {useNavigation} from '@react-navigation/native';

const Explore = () => {
  const navigation = useNavigation();

  const filterModalRef = useRef(null);

  const [mode, setMode] = useState('map');

  const handleFilter = useCallback(() => {
    filterModalRef.current?.expand();
  }, []);

  const handleCloseFilter = useCallback(() => {
    filterModalRef.current?.close();
  }, []);

  const handleSearch = useCallback(() => {
    navigation.navigate('apartment-search');
  }, [navigation]);

  const handleViewApartment = useCallback(
    id => {
      navigation.navigate('apartment_view', {apartment: id});
    },
    [navigation],
  );

  const renderListingItem = ({
    item: {category, image, user, location, price, properties, title, id},
  }) => {
    return (
      <ExploreListingItem
        image={image}
        title={title}
        userType={user}
        category={category}
        location={location}
        price={price}
        balconies={properties.balconies}
        bedrooms={properties.bedrooms}
        bathrooms={properties.bathrooms}
        id={id}
        handlePress={() => handleViewApartment(id)}
      />
    );
  };
  const list = [
    ...listings.sort(() => Math.random() - 0.5),
    ...listings.sort(() => Math.random() - 0.5),
    ...listings.sort(() => Math.random() - 0.5),
  ];

  return (
    <Layout ClassName={'relative'}>
      {/*Header*/}
      <ExploreHeader
        handleFilter={handleFilter}
        handleSearchFocus={handleSearch}
      />

      {/*  Filters  */}
      <ExploreFilters />
      {mode === 'map'
        ? renderMapView()
        : renderListView(list, renderListingItem)}
      <ExplorerMapBtn />

      <ExplorerFilterModal
        handleCloseFilter={handleCloseFilter}
        ref={filterModalRef}
      />
    </Layout>
  );
};

function renderListView(list, renderListingItem) {
  return (
    <FlashList
      // eslint-disable-next-line react-native/no-inline-styles
      contentContainerStyle={{
        padding: 16,
      }}
      data={list}
      renderItem={renderListingItem}
      keyExtractor={(_, ind) => ind.toString()}
      estimatedItemSize={300}
    />
  );
}

function renderMapView() {
  return <ExploreMapView />;
}

export default Explore;
