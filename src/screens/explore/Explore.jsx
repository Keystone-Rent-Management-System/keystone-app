import React, {useRef} from 'react';
import {FlashList} from '@shopify/flash-list';

import {
  ExploreFilters,
  ExploreHeader,
  ExplorerMapBtn,
  Layout,
} from '@/components';
import listings from '@/provider/listings';
import ListingItem from '@/components/screens/explore/ListingItem';
import {ExplorerFilterModal} from '@/components/modals';
import {useNavigation} from '@react-navigation/native';

const Explore = () => {
  const filterModalRef = useRef(null);
  const navigation = useNavigation();

  const handleFilter = () => {
    filterModalRef.current?.expand();
  };

  const handleCloseFilter = () => {
    filterModalRef.current?.close();
  };

  const handleViewApartment = id => {
    navigation.navigate('apartment_view', {apartment: id});
  };

  const renderListingItem = ({
    item: {category, image, user, location, price, properties, title, id},
  }) => {
    return (
      <ListingItem
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
      <ExploreHeader handleFilter={handleFilter} />

      {/*  Filters  */}
      <ExploreFilters />

      {/*  list  */}
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

      <ExplorerMapBtn />

      <ExplorerFilterModal
        handleCloseFilter={handleCloseFilter}
        ref={filterModalRef}
      />
    </Layout>
  );
};

export default Explore;
