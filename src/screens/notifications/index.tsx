import {FlashList} from '@shopify/flash-list';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React, {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {ExtensionSvg, InvoiceSvg} from '../../assets/icons';
import {Layout} from '../../components';
import EmptyList from '../../components/general/EmptyList.tsx';
import COLORS from '../../constants/Theme';
import NotificationService from '../../services/Notification';

const Notifications = () => {
  const {
    data: response,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => NotificationService.getNotifications(),
  });

  const renderEmptyList = useCallback(() => <EmptyList />, []);

  return (
    <Layout ClassName={''}>
      <FlashList
        refreshing={isPending}
        onRefresh={refetch}
        data={response?.content ?? []}
        renderItem={renderItem}
        estimatedItemSize={100}
        ListEmptyComponent={() => renderEmptyList()}
      />
    </Layout>
  );
};

const renderItem = ({item}: {item: any}) => (
  <View
    className={'flex-row p-2.5 px-4 border-b border-border_grey'}
    style={styles.notificationContainer}>
    {/* icon */}
    <View
      className={
        'items-center justify-center h-11 w-11 rounded-full bg-white overflow-hidden'
      }
      style={styles.iconContainer}>
      {
        // @ts-ignore
        notificationIcons.invoice(item.read && COLORS.inactive_text)
      }
    </View>

    {/* message */}
    <View className={'flex-1'}>
      <Text
        className={`font-open-sauce-sans  text-xs ${
          item.read ? 'text-inactive_text' : 'text-black'
        }`}>
        {item.message || item?.body}
      </Text>
      <Text className={'font-open-sauce-sans text-inactive_text text-11 mt-1.5'}>
        {moment(item.time || item?.createdAt).fromNow()}
      </Text>
    </View>

    {/* dot */}
    <View className={'justify-center px-1'}>
      <Indicator isRead={item.read} />
    </View>
  </View>
);

export default Notifications;

export const Indicator = ({isRead = undefined, isArrears = undefined}) => (
  <View
    className={`h-2 w-2  rounded-full ${
      isRead === true
        ? 'bg-none'
        : isRead === false
        ? 'bg-red-600'
        : isArrears === false
        ? 'bg-green-600'
        : isArrears === true
        ? 'bg-red-600'
        : 'bg-none'
    }`}
  />
);

const styles = StyleSheet.create({
  notificationContainer: {
    gap: 12,
  },
  iconContainer: {
    borderColor: COLORS.primary + '15',
    borderWidth: 1,
  },
});

const notificationIcons = {
  invoice: (color: string) => <InvoiceSvg size={25} color={color} />,
  extension: (color: string) => <ExtensionSvg size={25} color={color} />,
};
