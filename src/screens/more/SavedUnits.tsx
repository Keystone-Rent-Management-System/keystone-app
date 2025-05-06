import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import {StyleSheet} from 'react-native';

import {ExploreListingItem, Layout} from '@/components';
import {useFetchSavedUnits} from '../../hooks/useSavedUnits';
import {IProperty, IPropertyListingUpload} from '@/types/property';
import {getRandomFromArray} from '@/utils';
import {ISavedUnit} from '@/lib/sqlite';

const SavedUnits = () => {
  const navigation = useNavigation<any>();

  const {data, isFetching, refetch} = useFetchSavedUnits(); //fetches liked units

  const handleViewApartment = useCallback(
    (id: string) => {
      navigation.navigate('apartment_view', {apartment: id});
    },
    [navigation],
  );

  const renderListingItem = useCallback(
    ({item}: {item: ISavedUnit}) => {
      const propertyData: IProperty = item.data as IProperty;
      const firstPropertyImage = propertyData?.propertyUploads?.length
        ? getRandomFromArray<IPropertyListingUpload>(
            propertyData.propertyUploads,
          )?.fileUrl
        : '';

      return (
        <ExploreListingItem
          image={firstPropertyImage ?? ''}
          handlePress={() => handleViewApartment(propertyData?.id)}
          {...propertyData}
        />
      );
    },
    [handleViewApartment],
  );

  return (
    <Layout>
      <FlashList
        refreshing={isFetching}
        onRefresh={refetch}
        contentContainerStyle={styles.contentContainer}
        data={data}
        renderItem={renderListingItem}
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
});

export default SavedUnits;
