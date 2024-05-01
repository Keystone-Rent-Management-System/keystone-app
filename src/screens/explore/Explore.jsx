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
// import listings from '@/provider/listings';
import {ExplorerFilterModal} from '@/components/modals';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet, View} from 'react-native';
import {usePropertyListing} from '../../hooks';

const Explore = () => {
  const navigation = useNavigation();

  const {isPending, refetch, listings} = usePropertyListing();

  const filterModalRef = useRef(null);

  const [current, setCurrent] = useState(null);
  const [mode, setMode] = useState('list');

  const currentProperty = useMemo(() => {
    if (!isPending) {
      if (current) {
        return listings?.find(item => item?.id === current);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }, [current, isPending, listings]);

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

  const renderListingItem = ({item}) => {
    console.log(item);
    const {
      houseType,
      matterportUrl,
      user,
      property,
      rent,
      balconies,
      numberOfBedrooms,
      numberOfBathrooms,
      unitName,
      id,
    } = item;
    return (
      <ExploreListingItem
        image={matterportUrl}
        title={unitName}
        userType={user}
        category={houseType}
        location={`${property?.country}, ${property?.county}, ${property?.neighborhood}`}
        price={rent}
        balconies={balconies}
        bedrooms={numberOfBedrooms}
        bathrooms={numberOfBathrooms}
        id={id}
        handlePress={() => handleViewApartment(id)}
      />
    );
  };

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
        renderListView(listings, renderListingItem, isPending, refetch)
      )}

      <ExplorerMapBtn handlePress={handleSwitchMode} mode={mode} />

      <ExplorerFilterModal
        handleCloseFilter={handleCloseFilter}
        ref={filterModalRef}
      />

      {!!currentProperty && (
        <View
          style={styles.exploreView}
          className={'absolute z-50 inset-x-0 bottom-0 px-3 py-2'}>
          <ExploreListingItem
            image={currentProperty?.matterportUrl}
            title={currentProperty?.unitName}
            userType={'Landlord'}
            category={currentProperty?.houseType}
            location={`${currentProperty?.property?.country}, ${currentProperty?.property?.county}, ${currentProperty?.property?.neighborhood}`}
            price={currentProperty?.rent}
            balconies={5}
            bedrooms={currentProperty?.numberOfBedrooms}
            bathrooms={currentProperty?.numberOfBathrooms}
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

function renderListView(list, renderListingItem, loading, handleRefresh) {
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
      refreshing={loading}
      onRefresh={handleRefresh}
    />
  );
}

export default Explore;

const styles = StyleSheet.create({
  exploreView: {
    gap: 50,
  },
});
