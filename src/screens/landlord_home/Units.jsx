import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ActivityIndicator, View} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {CInput, Layout, ListingItem} from '@/components';
import {SearchSvg, UnitSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {propertyStyles, SearchHeader} from './property/Property';
import {useUnit} from '../../hooks';

const Units = () => {
  const navigation = useNavigation();
  const [size, setSize] = useState(20);

  const {
    isPending,
    isRefetching,
    units,
    totalElements,
    refetch,
    search,
    setSearch,
  } = useUnit(size);

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
        ListHeaderComponent={
          <SearchHeader search={search} setSearch={setSearch} />
        }
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

export const Header = () => (
  <CInput
    ClassName={'rounded-xl mb-3 overflow-hidden border-border_grey'}
    icon={
      <View className={'px-3 black my-auto flex items-center justify-center'}>
        <SearchSvg size={'18'} />
      </View>
    }
    InputClassName={'placeholder-grey_1 flex-1 p-2 px-0 font-open-sauce-sans text-xs'}
    placeHolder={'Search unit'}
    placeholderTextColor={COLORS.inactive_text}
    showSoftInputOnFocus={false}
  />
);

export const renderUnitItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<UnitSvg size={'24'} />}
      title={item?.name}
      status={item?.occupationStatus}
      handlePress={() => handlePress(item?.name)}
    />
  );
};

export default Units;
