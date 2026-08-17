import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React from 'react';
import {
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Icon} from '../../components/premium';
import {Screen, SectionLabel, eventDate} from '../../components/kit';
import COLORS from '../../constants/Theme';
import NotificationService from '../../services/Notification';
import {getError} from '../../utils/getError';
import {toast} from '../../utils/toast';

// Inbox (design 2f): hub title under an owned status zone (S1/S2 —
// retires the title/clock collision), grouped NEW / EARLIER with gold
// unread dots. Icon chips are semantic-tinted only while unread;
// payment rows carry the verb-dated meta beside relative time (D2/D4).

const ICON: Record<string, string> = {
  REMINDER: 'bell',
  RECEIPT: 'card',
  PAYMENT: 'card',
  LEASE: 'lease',
};

const isPaymentType = (t?: string) => t === 'RECEIPT' || t === 'PAYMENT';

// 2f row: 40px semantic-tinted tile while unread (payment = green,
// reminder = gold), neutral canvas tile once read; 17px title with an
// inline 8px stone dot; 15px slate body; 13px meta.
const tileStyle = (item: any) => {
  if (item.read) return {bg: '#F4F2EC', fg: '#A89977'};
  if (isPaymentType(item.type)) return {bg: 'rgba(5,166,96,0.10)', fg: '#037147'};
  return {bg: 'rgba(205,160,0,0.12)', fg: '#7A6100'};
};

const NotificationRow = ({
  item,
  last,
  onPress,
}: {
  item: any;
  last?: boolean;
  onPress?: () => void;
}) => {
  const read = !!item.read;
  const when = item.createdAt ?? item.time;
  const meta = [
    isPaymentType(item.type) && when ? eventDate('Paid', when) : null,
    when ? moment(when).fromNow() : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const tile = tileStyle(item);

  // Unread rows are tappable to mark read; read rows have no action, so
  // they stay a plain View rather than a button that does nothing.
  const Row: any = read ? View : TouchableOpacity;

  return (
    <Row
      {...(read ? {} : {onPress, activeOpacity: 0.7})}
      className="flex-row items-start gap-3"
      style={{
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: 'rgba(21,37,53,0.08)',
      }}>
      <View
        className="items-center justify-center"
        style={{width: 40, height: 40, borderRadius: 12, backgroundColor: tile.bg}}>
        <Icon name={ICON[item.type] ?? 'bell'} size={18} color={tile.fg} />
      </View>
      <View className="flex-1" style={{minWidth: 0}}>
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className="text-keystone_navy font-inter-semibold flex-1"
            style={{fontSize: 17, minWidth: 0}}>
            {item.title ?? 'Keystone'}
          </Text>
          {!read && (
            <View
              className="w-2 h-2 rounded-full"
              style={{backgroundColor: '#A89977'}}
            />
          )}
        </View>
        <Text
          className="text-keystone_slate font-inter"
          style={{fontSize: 15, lineHeight: 22, marginTop: 2}}>
          {item.body ?? item.message ?? ''}
        </Text>
        <Text className="font-inter" style={{fontSize: 13, marginTop: 4, color: 'rgba(59,83,102,0.7)'}}>
          {meta}
        </Text>
      </View>
    </Row>
  );
};

const Notifications = () => {
  const queryClient = useQueryClient();
  const {data, isPending, isFetching, refetch} = useQuery({
    queryKey: ['notifications'],
    queryFn: () => NotificationService.getNotifications(),
  });

  // Tapping an unread row marks it read (PATCH /notifications/{id}/read).
  // The list already groups on `item.read`, so the row moves NEW → EARLIER
  // on the refetch. Optimism is deliberately skipped: a failed PATCH that
  // had already moved the row would read as "handled" when it wasn't.
  const markRead = useMutation({
    mutationFn: (id: string) => NotificationService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['notifications']});
      queryClient.invalidateQueries({queryKey: ['notifications', 'unread']});
    },
    onError: err => {
      toast.show("Couldn't mark that as read — " + getError(err), toast.SHORT);
    },
  });

  const items: any[] = (data as any)?.content ?? [];
  const fresh = items.filter(i => !i.read);
  const earlier = items.filter(i => !!i.read);

  return (
    <Screen
      variant="hub"
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isPending}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }
      contentStyle={{paddingTop: 16}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <Text
        className="text-keystone_navy font-inter-bold mb-5"
        style={{fontSize: 34, lineHeight: 40, letterSpacing: -0.3}}>
        Inbox
      </Text>

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
        <>
          {fresh.length > 0 && (
            <>
              <SectionLabel>New</SectionLabel>
              <View
                className="bg-white"
                style={{borderRadius: 20, paddingVertical: 4, paddingHorizontal: 16}}>
                {fresh.map((item, i) => (
                  <NotificationRow
                    key={item.id ?? `n${i}`}
                    item={item}
                    last={i === fresh.length - 1}
                    onPress={() => item.id && markRead.mutate(item.id)}
                  />
                ))}
              </View>
            </>
          )}
          {earlier.length > 0 && (
            <>
              <SectionLabel style={{marginTop: fresh.length ? 18 : 0}}>
                Earlier
              </SectionLabel>
              <View
                className="bg-white"
                style={{borderRadius: 20, paddingVertical: 4, paddingHorizontal: 16}}>
                {earlier.map((item, i) => (
                  <NotificationRow
                    key={item.id ?? `e${i}`}
                    item={item}
                    last={i === earlier.length - 1}
                  />
                ))}
              </View>
            </>
          )}
        </>
      )}
    </Screen>
  );
};

export default Notifications;
