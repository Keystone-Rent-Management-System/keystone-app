import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import moment from 'moment/moment';
import React from 'react';

import {HomeSvg} from '@/assets/icons';
import {Layout} from '@/components';
import COLORS from '@/constants/Theme';
import {AgreementListingItem} from '../../../components';
import {useAgrement} from '../../../hooks';
import {invoiceStyles} from '../../tenant_home/invoice/Unpaid';

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
        keyExtractor={(_, ind) => ind?.toString()}
        estimatedItemSize={300}
        refreshing={isPending}
        onRefresh={refetch}
      />
    </Layout>
  );
};

export const renderUnitListItem = (item, handlePress = () => {}) => {
  return (
    <AgreementListingItem
      icon={<HomeSvg color={COLORS.primary} size={'24'} />}
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
