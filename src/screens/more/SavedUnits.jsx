import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';

import {ExploreListingItem, Layout} from '@/components';
import {useFetchSavedUnits} from '../../hooks/useSavedUnits';

const SavedUnits = () => {
  const navigation = useNavigation();

  const {data, isFetching, refetch} = useFetchSavedUnits(); //fetches liked units

  const handleViewApartment = useCallback(
    id => {
      navigation.navigate('apartment_view', {apartment: id});
    },
    [navigation],
  );

  const renderListingItem = ({item: {data: item}}) => {
    const firstPropertyImage = item?.uploads?.at(0)?.fileUrl;

    const {
      houseType,
      user,
      property,
      rent,
      balconies,
      numberOfBedrooms,
      numberOfBathrooms,
      listingId: id,
    } = item;

    return (
      <ExploreListingItem
        title={item?.property?.name}
        userType={user}
        category={houseType}
        location={`${property?.address?.line ?? ''}`}
        price={rent}
        balconies={balconies}
        bedrooms={numberOfBedrooms}
        bathrooms={numberOfBathrooms}
        image={firstPropertyImage ?? ''}
        id={id}
        handlePress={() => handleViewApartment(id)}
        data={item}
      />
    );
  };

  return (
    <Layout>
      <FlashList
        refreshing={isFetching}
        onRefresh={refetch}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 3,
        }}
        data={data}
        renderItem={renderListingItem}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export default SavedUnits;
