import React, {useState} from 'react';
import {FlashList} from '@shopify/flash-list';
import {Layout} from '@/components';
import {propertyStyles} from './Property';
import {usePropertyUnits} from '../../../hooks';
import {renderUnitItem, Header} from '../Units';

const PropertyView = ({route: {params}}) => {
  const [size, setSize] = useState(20);

  const {isPending, units, refetch} = usePropertyUnits(params.id, size);

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

export default PropertyView;
