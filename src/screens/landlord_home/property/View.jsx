import React, {useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import {Layout} from '@/components';
import {propertyStyles} from './Property';
import {usePropertyUnits} from '../../../hooks';
import {renderUnitItem, Header} from '../Units';

const PropertyView = ({route: {params}}) => {
  const navigation = useNavigation();
  const [size, setSize] = useState(20);

  const {isPending, isRefetching, units, totalElements, refetch} =
    usePropertyUnits(params.id, size);

  const handleNavigate = unitName => {
    navigation.navigate('statements', {
      screen: 'unit_statements',
      params: {unitName: unitName},
    });
  };

  const handleLoadMore = () => {
    if (!isPending && !isRefetching && totalElements > size) {
      setSize(prev => prev + 10);
      refetch();
    }
  };

  return (
    <Layout>
      <FlashList
        ListHeaderComponent={<Header />}
        contentContainerStyle={propertyStyles.list}
        refreshing={isPending || isRefetching}
        data={units}
        renderItem={({item}) => renderUnitItem(item, handleNavigate)}
        keyExtractor={item => item?.id}
        estimatedItemSize={20}
        onRefresh={refetch}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isRefetching ? (
            <ActivityIndicator color={'#022374'} size="large" />
          ) : null
        }
      />
    </Layout>
  );
};

export default PropertyView;
