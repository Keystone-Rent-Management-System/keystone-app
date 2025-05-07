import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import React from 'react';

import {HomeSvg} from '@/assets/icons';
import {Layout} from '@/components';
import COLORS from '@/constants/Theme';
import {useNavigation} from '@react-navigation/native';
import {AgreementListingItem} from '../../../components';
import {useAgrement} from '../../../hooks';
import {invoiceStyles} from '../../tenant_home/invoice/Unpaid';

const Previous = () => {
  const navigation = useNavigation();

  const handleNavigate = id => {
    navigation.navigate('my_units__view', {agreementId: id, type: 'previous'});
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
        moment(item?.terminatedOn)?.format('Do MMMM, YYYY')
      }
      unit={item?.propertyUnits?.name}
      amount={item?.propertyUnits?.rent}
      handlePress={() => handlePress(item?.id)}
    />
  );
};

export default Previous;
