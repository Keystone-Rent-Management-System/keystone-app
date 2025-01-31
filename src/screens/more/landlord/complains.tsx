import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import React, {useCallback} from 'react';
import {StyleSheet, Text} from 'react-native';

import {ComplainSvg} from '../../../assets/icons';
import {EmptyInvoiceList, Layout} from '../../../components';

export default function Complains() {
  const renderComplain = useCallback(() => <Text>Complain</Text>, []);

  return (
    <Layout ClassName={''}>
      <FlashList
        // ListHeaderComponent={<Header />}
        contentContainerStyle={styles.list}
        data={[]}
        renderItem={renderComplain}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={20}
        ListEmptyComponent={renderEmptyComplains}
      />
    </Layout>
  );
}

interface IComplain {
  date: Date;
  title: string;
  status: string;
}
const complains: IComplain[] = [
  {
    date: new Date(moment().subtract(3, 'days').toDate()),
    title: 'Broken Toilet',
    status: 'Pending',
  },
  {
    date: new Date(moment().subtract(5, 'days').toDate()),
    title: 'Leaking Roof',
    status: 'Resolved',
  },
  {
    date: new Date(moment().subtract(7, 'days').toDate()),
    title: 'Faulty Bulb',
    status: 'Pending',
  },
  {
    date: new Date(moment().subtract(9, 'days').toDate()),
    title: 'Faulty Door',
    status: 'Resolved',
  },
];

export const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
});

const renderEmptyComplains = () => (
  <EmptyInvoiceList
    icon={<ComplainSvg size="40" />}
    title={'No Complains Found!'}
    subTitle={'No complains have been made yet.'}
  />
);
