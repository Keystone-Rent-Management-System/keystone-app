import React from 'react';
import moment from 'moment';
import {FlashList} from '@shopify/flash-list';

import {Layout, ListingItem} from '@/components';
import {invoiceStyles} from '../../home/invoice/Unpaid';
import {HomeSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {useNavigation} from '@react-navigation/native';
import {useAgrement} from '../../../hooks';

const Previous = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('my_units__view', {unitId: id});
  };

  const {isPending, agreements, refetch} = useAgrement();

  const previousUnits =
    !isPending &&
    agreements?.filter(
      previousAgreement =>
        previousAgreement?.status?.toLowerCase() === 'terminated',
    );

  return (
    <Layout>
      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={previousUnits}
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
        moment(item?.tenancyBeginningDate).format('Do MMMM, YYYY') +
        ' - ' +
        moment(item?.terminatedOn).format('Do MMMM, YYYY')
      }
      unit={item?.propertyUnits?.name}
      amount={item?.propertyUnits?.rent}
      handlePress={() => handlePress(item?.propertyUnits?.id)}
    />
  );
};

export default Previous;
