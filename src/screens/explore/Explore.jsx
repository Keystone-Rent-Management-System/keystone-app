import React, {useCallback, useMemo, useRef, useState} from 'react';
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
import {View} from 'react-native';

const Explore = () => {
  const navigation = useNavigation();

  const filterModalRef = useRef(null);

  const [current, setCurrent] = useState(null);
  const [mode, setMode] = useState('map');

  const currentProperty = useMemo(() => {
    if (current) {
      return listings.find(item => item?.id === current);
    } else {
      return null;
    }
  }, [current]);

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

  const handleSwitchMode = () => {
    setMode(prev => (prev === 'map' ? 'list' : 'map'));
  };
  console.log(current);
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
      {mode === 'map' ? (
        <ExploreMapView current={current} setCurrent={setCurrent} />
      ) : (
        renderListView(list, renderListingItem)
      )}

      <ExplorerMapBtn handlePress={handleSwitchMode} mode={mode} />

      <ExplorerFilterModal
        handleCloseFilter={handleCloseFilter}
        ref={filterModalRef}
      />

      {!!currentProperty && (
        <View
          style={{elevation: 50}}
          className={'absolute z-50 inset-x-0 bottom-0 px-3 py-2'}>
          <ExploreListingItem
            image={currentProperty?.image}
            title={currentProperty?.title}
            userType={currentProperty?.user}
            category={currentProperty?.category}
            location={currentProperty?.location}
            price={currentProperty?.price}
            balconies={currentProperty?.properties.balconies}
            bedrooms={currentProperty?.properties.bedrooms}
            bathrooms={currentProperty?.properties.bathrooms}
            id={currentProperty?.id}
            showBack
            imgClassName={'h-24 rounded-none'}
            containerClassName={'mb-0 bg-white rounded-xl overflow-hidden'}
            textContainerClassName={'px-3'}
            handlePress={() => handleViewApartment(currentProperty?.id)}
            handleClose={() => setCurrent(null)}
          />
        </View>
      )}
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

export default Explore;
