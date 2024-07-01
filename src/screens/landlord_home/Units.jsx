import React, {useState} from 'react';
import {View} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {CInput, Layout, ListingItem} from '@/components';
import {SearchSvg, UnitSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {propertyStyles} from './property/Property';
import {useUnit} from '../../hooks';

const Units = () => {
  const [size, setSize] = useState(20);

  const {isPending, units, refetch} = useUnit(size);

  return (
    <Layout>
      <FlashList
        ListHeaderComponent={<Header />}
        contentContainerStyle={propertyStyles.list}
        refreshing={isPending}
        data={units}
        renderItem={({item}) => renderUnitItem(item)}
        keyExtractor={item => item?.id}
        estimatedItemSize={300}
        onRefresh={refetch}
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
    InputClassName={'placeholder-grey_1 flex-1 p-2 px-0 font-inter text-xs'}
    placeHolder={'Search unit'}
    placeholderTextColor={COLORS.inactive_text}
    showSoftInputOnFocus={false}
  />
);

export const renderUnitItem = item => {
  return (
    <ListingItem
      icon={<UnitSvg size={'24'} />}
      title={item?.name}
      status={item?.occupationStatus}
    />
  );
};

export default Units;
