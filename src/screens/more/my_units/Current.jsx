import React from 'react';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment/moment';
import {FlashList} from '@shopify/flash-list';

import {Layout, ListingItem} from '@/components';
import {invoiceStyles} from '../../home/invoice/Unpaid';
import {HomeSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {useAgrement} from '../../../hooks';

const Current = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('my_units__view', {unitId: id});
  };

  const {isPending, agreements, refetch} = useAgrement();

  const currentUnits =
    !isPending &&
    agreements?.filter(
      currentAgreement =>
        currentAgreement?.status?.toLowerCase() === 'agreed' ||
        currentAgreement?.status?.toLowerCase() === 'accepted',
    );

  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={currentUnits}
        renderItem={({item}) => renderUnitListItem(item, handleNavigate)}
        keyExtractor={item => item?.id}
        estimatedItemSize={300}
        refreshing={isPending}
        onRefresh={refetch}
      />
    </Layout>
  );
};

export const renderUnitListItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<HomeSvg color={COLORS.primary} size={'24'} />}
      id={item?.id}
      title={item?.propertyUnits?.property?.name}
      customDate={
        moment(item?.tenancyBeginningDate)?.format('Do MMMM, YYYY') +
        ' - ' +
        'Current'
      }
      unit={item?.propertyUnits?.name}
      amount={item?.propertyUnits?.rent}
      handlePress={() => handlePress(item?.propertyUnits?.id)}
    />
  );
};

export default Current;
