import React, {useCallback, useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';

// import {ExtensionSvg, InvoiceSvg} from '@/assets/icons';
import {Layout} from '../../components';
import COLORS from '../../constants/Theme';
import moment from 'moment';
import {FlashList} from '@shopify/flash-list';
import {useQuery} from '@tanstack/react-query';
import NotificationService from '../../services/Notification';
import {ExtensionSvg, InvoiceSvg} from '../../assets/icons';
import EmptyList from '../../components/general/EmptyList.tsx';

const Notifications = () => {
  const {
    data: response,
    isPending,
    refetch,
    error,
    isError,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => NotificationService.getNotifications(),
  });

  useEffect(() => {
    if (isError) {
      console.log('ERROR IN FETCHING NOTIFICATIONS\n', error);
    }
  }, [error, isError]);

  const renderEmptyList = useCallback(() => <EmptyList />, []);

  return (
    <Layout ClassName={''}>
      <FlashList
        refreshing={isPending}
        onRefresh={refetch}
        data={response?.data ?? []}
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
        notificationIcons[item?.category](item.read && COLORS.inactive_text)
      }
    </View>

    {/* message */}
    <View className={'flex-1'}>
      <Text
        className={`font-inter  text-xs ${
          item.read ? 'text-inactive_text' : 'text-black'
        }`}>
        {item.message}
      </Text>
      <Text className={'font-inter text-inactive_text text-11 mt-1.5'}>
        {moment(item.time).fromNow()}
      </Text>
    </View>

    {/* dot */}
    <View className={'justify-center px-1'}>
      <Indicator isRead={item.read} />
    </View>
  </View>
);

export default Notifications;

export const Indicator = ({isRead = false}) => (
  <View
    className={`h-2 w-2  rounded-full ${isRead ? 'bg-none' : 'bg-red-600'}`}
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

const date = moment();

const notifications = [
  {
    category: 'invoice',
    message: 'You have received your month of April Invoice, View to Pay',
    time: date.clone().subtract(2, 'hours'),
    read: false,
  },
  {
    category: 'invoice',
    message:
      'You have payment invoice #2456523 has been accepted and confirmed.',
    time: date.clone().subtract(3, 'hours'),
    read: false,
  },
  {
    category: 'extension',
    message: 'Rent extension request declined.',
    time: date.clone().subtract(4, 'hours'),
    read: false,
  },
  {
    category: 'invoice',
    message: 'You have received your month of April Invoice, View to Pay',
    time: date.clone().subtract(5, 'hours'),
    read: false,
  },
  {
    category: 'extension',
    message: 'You have received your month of April Invoice, View to Pay',
    time: date.clone().subtract(6, 'hours'),
    read: false,
  },

  {
    category: 'invoice',
    message: 'You have received your month of March Invoice, View to Pay',
    time: date.clone().subtract(24 * 30, 'hours'),
    read: true,
  },
  {
    category: 'invoice',
    message:
      'You have payment invoice #2456588 has been accepted and confirmed.',
    time: date.clone().subtract(24 * 28, 'hours'),
    read: true,
  },
  {
    category: 'extension',
    message: 'Rent extension request accepted.',
    time: date.clone().subtract(24 * 60, 'hours'),
    read: true,
  },
  {
    category: 'invoice',
    message: 'You have received your month of February Invoice, View to Pay',
    time: date.clone().subtract(24 * 90, 'hours'),
    read: true,
  },
  {
    category: 'extension',
    message: 'You have received your month of January Invoice, View to Pay',
    time: date.clone().subtract(24 * 90, 'hours'),
    read: true,
  },
  {
    category: 'invoice',
    message: 'You have received your month of March Invoice, View to Pay',
    time: date.clone().subtract(24 * 30, 'hours'),
    read: true,
  },
  {
    category: 'invoice',
    message:
      'You have payment invoice #2456588 has been accepted and confirmed.',
    time: date.clone().subtract(24 * 28, 'hours'),
    read: true,
  },
  {
    category: 'extension',
    message: 'Rent extension request accepted.',
    time: date.clone().subtract(24 * 60, 'hours'),
    read: true,
  },
  {
    category: 'invoice',
    message: 'You have received your month of February Invoice, View to Pay',
    time: date.clone().subtract(24 * 90, 'hours'),
    read: true,
  },
  {
    category: 'extension',
    message: 'You have received your month of January Invoice, View to Pay',
    time: date.clone().subtract(24 * 90, 'hours'),
    read: true,
  },
];

const notificationIcons = {
  invoice: (color: string) => <InvoiceSvg size={25} color={color} />,
  extension: (color: string) => <ExtensionSvg size={25} color={color} />,
};
