import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import {CInput, Layout, ListingItem} from '@/components';
import {PropertySvg, SearchSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {useProperty} from '../../../hooks';

const Property = () => {
  const navigation = useNavigation();
  const [size, setSize] = useState(20);

  const handleNavigate = (id, propertyName) => {
    navigation.navigate('my_properties__view', {id, propertyName});
  };

  const {
    isPending,
    isRefetching,
    properties,
    totalElements,
    refetch,
    setSearch,
    search,
  } = useProperty(size);

  const handleLoadMore = () => {
    if (!isPending && !isRefetching && totalElements > size) {
      setSize(prev => prev + 10);
      refetch();
    }
  };

  return (
    <Layout>
      <FlashList
        ListHeaderComponent={<Header setSearch={setSearch} search={search} />}
        contentContainerStyle={propertyStyles.list}
        refreshing={isPending || isRefetching}
        data={properties}
        renderItem={({item}) => renderPropertyItem(item, handleNavigate)}
        keyExtractor={item => item?.id}
        estimatedItemSize={300}
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

const Header = ({setSearch, search}) => {
  return (
    <CInput
      ClassName={'rounded-xl mb-3 overflow-hidden border-border_grey'}
      icon={
        <View className={'px-3 black my-auto flex items-center justify-center'}>
          <SearchSvg size={'18'} />
        </View>
      }
      InputClassName={'placeholder-grey_1 flex-1 p-2 px-0 font-inter text-xs'}
      placeHolder={'Search property'}
      placeholderTextColor={COLORS.inactive_text}
      onChangeText={setSearch}
      value={search}
    />
  );
};

export const renderPropertyItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<PropertySvg size={'24'} />}
      title={item?.name}
      handlePress={() => handlePress(item?.id, item?.name)}
    />
  );
};

export const propertyStyles = StyleSheet.create({
  list: {
    padding: 16,
  },
});

export default Property;
