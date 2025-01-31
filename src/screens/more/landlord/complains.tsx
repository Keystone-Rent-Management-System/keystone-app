import {FlashList} from '@shopify/flash-list';
import moment from 'moment';
import React, {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {ComplainSvg} from '../../../assets/icons';
import {EmptyInvoiceList, Layout} from '../../../components';

export default function Complaints() {
  const renderComplaint = useCallback(
    ({item}: {item: IComplain}) => <ComplaintItem complain={item} />,
    [],
  );

  return (
    <Layout ClassName={'p-2 py-0'}>
      <FlashList
        contentContainerStyle={styles.list}
        data={complains}
        renderItem={renderComplaint}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={20}
        ListEmptyComponent={renderEmptyComplaints}
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
    title:
      'The upstairs neighbors are too loud late at night. It’s hard to sleep with all the stomping and music.',
    status: 'In-Progress',
  },
  {
    date: new Date(moment().subtract(50, 'days').toDate()),
    title:
      'The water heater is broken and needs to be fixed. It’s been out for a week now.',
    status: 'Resolved',
  },
  {
    date: new Date(moment().subtract(12, 'days').toDate()),
    title:
      'The air conditioning is not working properly. It’s too hot in the apartment.',
    status: 'In-Progress',
  },
  {
    date: new Date(moment().subtract(100, 'days').toDate()),
    title:
      'The hallways haven’t been cleaned in weeks. There’s dirt and trash piling up',
    status: 'Resolved',
  },
];

export const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
});

const renderEmptyComplaints = () => (
  <EmptyInvoiceList
    icon={<ComplainSvg size="40" />}
    title={'No Complains Found!'}
    subTitle={'No complains have been made yet.'}
  />
);

const ComplaintItem = ({complain}: {complain: IComplain}) => (
  <View
    className={'flex-row gap-x-2 rounded-xl mb-3 border py-2 border-gray-100'}>
    {/* icon */}
    <View>
      <View className={'p-2 rounded-full border border-slate-200'}>
        <ComplainSvg size="26" />
      </View>
    </View>

    <View className={'flex-1 flex-col gap-1.5 pr-3'}>
      <Text className="text-[11px] text-gray-400 font-inter">
        {moment(complain.date).format('Do MMM YYYY')}
      </Text>

      <Text className="text-primary font-inter-medium text-[13px] leading-5">
        {complain.title}
      </Text>

      <View
        className={`rounded-full ${
          complain.status?.toLocaleLowerCase() === 'resolved'
            ? 'bg-green-100'
            : 'bg-gray-100'
        } p-1 px-3 mr-auto`}>
        <Text
          className={` ${
            complain.status?.toLocaleLowerCase() === 'resolved'
              ? 'text-green-700'
              : 'text-gray-600'
          } text-center font-inter-medium text-[11px]`}>
          {complain.status}
        </Text>
      </View>
    </View>
  </View>
);
