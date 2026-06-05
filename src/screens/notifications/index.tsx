import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React from 'react';
import {RefreshControl, ScrollView, Text, View} from 'react-native';

import {IconChip, Icon} from '../../components/premium';
import COLORS from '../../constants/Theme';
import NotificationService from '../../services/Notification';

// Notifications — the tenant's rent timeline: reminders, receipts and
// lease updates, in the Keystone language. Unread items get a gold dot.

const ICON: Record<string, string> = {
  REMINDER: 'bell',
  RECEIPT: 'card',
  PAYMENT: 'card',
  LEASE: 'lease',
};

const Notifications = () => {
  const {data, isPending, isFetching, refetch} = useQuery({
    queryKey: ['notifications'],
    queryFn: () => NotificationService.getNotifications(),
  });

  const items: any[] = (data as any)?.content ?? [];

  return (
    <View className="flex-1 bg-keystone_canvas">
      <ScrollView
        contentContainerStyle={{paddingVertical: 12}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isPending}
            onRefresh={refetch}
            tintColor={COLORS.keystone_gold}
          />
        }>
        {items.length === 0 && !isPending ? (
          <View className="items-center justify-center py-24 px-8">
            <Text className="text-keystone_navy font-inter-semibold text-base">
              You’re all caught up
            </Text>
            <Text className="text-text_muted font-inter text-sm mt-1 text-center">
              Rent reminders and receipts will show up here.
            </Text>
          </View>
        ) : (
          items.map((item, i) => {
            const read = !!item.read;
            const title = item.title ?? 'Keystone';
            const body = item.body ?? item.message ?? '';
            const when = item.createdAt ?? item.time;
            return (
              <View
                key={item.id ?? i}
                className="flex-row items-start gap-3 px-4 py-3.5 mx-3 mb-2 bg-white rounded-2xl border border-keystone_hairline">
                <IconChip size={40}>
                  <Icon
                    name={ICON[item.type] ?? 'bell'}
                    size={18}
                    color={read ? COLORS.text_muted : COLORS.keystone_gold}
                  />
                </IconChip>
                <View className="flex-1">
                  <Text
                    className={`font-inter-semibold text-sm ${
                      read ? 'text-text_muted' : 'text-keystone_navy'
                    }`}>
                    {title}
                  </Text>
                  <Text className="text-text_muted font-inter text-xs mt-0.5 leading-4">
                    {body}
                  </Text>
                  <Text className="text-text_muted font-inter text-2xs mt-1.5">
                    {when ? moment(when).fromNow() : ''}
                  </Text>
                </View>
                {!read && (
                  <View
                    className="w-2 h-2 rounded-full mt-1"
                    style={{backgroundColor: COLORS.keystone_gold}}
                  />
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default Notifications;
