import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useMemo, useRef, useState} from 'react';

import {
  ExploreFilters,
  ExploreHeader,
  ExploreListingItem,
  ExploreMapView,
  ExplorerMapBtn,
  Layout,
} from '../../components';
// import listings from '@/provider/listings';
import {IProperty, IPropertyListingUpload} from '@/types/property';
import {getRandomFromArray} from '@/utils';
import BottomSheet from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {ExplorerFilterModal} from '../../components/modals';
import {usePropertyListing} from '../../hooks';

const Explore = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const {
    isPending,
    isRefetching,
    listings,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    handleAddRemoveFilter,
  } = usePropertyListing();

  const renderListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      renderFlashListFooter();
    }
    return null;
  }, [isFetchingNextPage]);

  const filterModalRef = useRef<BottomSheet>(null);

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
    // @ts-ignore
    navigation.navigate('apartment-search');
  }, [navigation]);

  const handleViewApartment = useCallback(
    (id: string) => {
      return navigation.navigate('apartment_view', {apartment: id});
    },
    [navigation],
  );

  const handleLoadMore = useCallback(async () => {
    if (!isRefetching && !isFetchingNextPage && hasNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching]);

  const handleSwitchMode = () => {
    setMode(prev => (prev === 'map' ? 'list' : 'map'));
  };

  const renderListingItem = useCallback(
    ({item}: {item: IProperty}) => {
      const firstPropertyImage = item?.propertyUploads?.length
        ? getRandomFromArray<IPropertyListingUpload>(item.propertyUploads)
            ?.fileUrl
        : '';

      return (
        <ExploreListingItem
          image={firstPropertyImage ?? ''}
          handlePress={() => handleViewApartment(item?.id)}
          {...item}
        />
      );
    },
    [handleViewApartment],
  );

  return (
    <Layout ClassName={'relative'}>
      {/*Header*/}
      <ExploreHeader
        handleFilter={handleFilter}
        handleSearchFocus={handleSearch}
      />

      {/*  Filters  */}
      <ExploreFilters handleAddRemoveFilter={handleAddRemoveFilter} />

      {/* <Text>{JSON.stringify(listings, null, 2)}</Text> */}

      {mode === 'map' ? (
        <ExploreMapView
          current={current}
          setCurrent={setCurrent}
          listings={listings}
          isPending={isPending}
        />
      ) : (
        <FlashList
          // eslint-disable-next-line react-native/no-inline-styles
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 30,
          }}
          // data={[]}
          data={listings}
          renderItem={renderListingItem}
          keyExtractor={(_, ind) => ind.toString()}
          estimatedItemSize={100}
          refreshing={isPending}
          onRefresh={refetch}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={2}
          ListFooterComponent={renderListFooter}
        />
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
          {/* @ts-ignore */}
          <ExploreListingItem
            image={''}
            location={`${currentProperty?.property?.country}, ${currentProperty?.property?.county}, ${currentProperty?.property?.neighborhood}`}
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

export default Explore;

const styles = StyleSheet.create({
  exploreView: {
    gap: 50,
  },
});

export function renderFlashListFooter() {
  return <ActivityIndicator color={'#022374'} size="large" />;
}
