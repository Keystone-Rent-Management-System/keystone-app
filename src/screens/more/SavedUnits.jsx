import React, {useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';

import {ExploreListingItem, Layout} from '../../components';
import listings from '../../provider/listings';

const SavedUnits = () => {
  const navigation = useNavigation();

  const handleViewApartment = useCallback(
    id => {
      navigation.navigate('apartment_view', {apartment: id});
    },
    [navigation],
  );
  const renderListingItem = ({item}) => {
    const {category, image, user, location, price, properties, title, id} =
      item;
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
        isSaved={item?.isFavorite}
      />
    );
  };

  const list = useMemo(() => listings.filter(item => item?.isFavorite), []);

  return (
    <Layout>
      <FlashList
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 3,
        }}
        data={list}
        renderItem={renderListingItem}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export default SavedUnits;
