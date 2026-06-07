import React, {useEffect, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Label, Divider, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Notification preferences — what the tenant hears about and how. Saving is
// optimistic; PATCH /tenants/notification-preferences persists it.

const TOPICS = [
  {key: 'rentReminders', icon: 'bell', title: 'Rent reminders', sub: 'Before rent is due'},
  {key: 'paymentReceipts', icon: 'card', title: 'Payment receipts', sub: 'When a payment settles'},
  {key: 'repairs', icon: 'wrench', title: 'Repairs & maintenance', sub: 'Status on your requests'},
  {key: 'leaseRenewals', icon: 'lease', title: 'Lease & renewals', sub: 'Offers and notices'},
  {key: 'creditUpdates', icon: 'trending', title: 'Credit updates', sub: 'When your score changes'},
];

const REMIND_DAYS = [1, 3, 5];

const NotificationPrefs = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const prefs = home?.notificationPrefs ?? {};

  const [channels, setChannels] = useState(
    prefs.channels ?? {push: true, email: true, sms: false},
  );
  const [topics, setTopics] = useState(prefs.topics ?? {});
  const [reminderDays, setReminderDays] = useState(prefs.rentReminderDays ?? 5);

  // Sync once the shared query resolves.
  useEffect(() => {
    if (prefs.channels) setChannels(prefs.channels);
    if (prefs.topics) setTopics(prefs.topics);
    if (prefs.rentReminderDays) setReminderDays(prefs.rentReminderDays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home?.notificationPrefs]);

  // PATCH /tenants/notification-preferences — optimistic, silent.
  const persist = () => {};

  const toggleChannel = key => {
    setChannels(c => ({...c, [key]: !c[key]}));
    persist();
  };
  const toggleTopic = key => {
    setTopics(t => ({...t, [key]: !t[key]}));
    persist();
  };
  const pickDays = d => {
    setReminderDays(d);
    persist();
    ToastAndroid.show(`Reminders ${d} day${d > 1 ? 's' : ''} before`, ToastAndroid.SHORT);
  };

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Channels */}
        <View className="px-4 pt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            How we reach you
          </Text>
          <Card style={{paddingVertical: 6}}>
            {[
              {key: 'push', title: 'Push notifications', sub: 'On this device'},
              {key: 'email', title: 'Email', sub: 'To your inbox'},
              {key: 'sms', title: 'Text messages', sub: 'Standard rates may apply'},
            ].map((c, i) => (
              <View key={c.key}>
                {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                <View className="flex-row items-center px-3 py-3">
                  <View className="flex-1">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">{c.title}</Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">{c.sub}</Text>
                  </View>
                  <Switch
                    value={!!channels[c.key]}
                    onValueChange={() => toggleChannel(c.key)}
                    trackColor={{true: COLORS.keystone_gold, false: '#CBD2D9'}}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Topics */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            What you hear about
          </Text>
          <Card style={{paddingVertical: 6}}>
            {TOPICS.map((t, i) => (
              <View key={t.key}>
                {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                <View className="flex-row items-center px-3 py-3">
                  <IconChip size={38}>
                    <Icon name={t.icon} size={17} color={COLORS.keystone_gold} />
                  </IconChip>
                  <View className="flex-1 ml-3">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">{t.title}</Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">{t.sub}</Text>
                  </View>
                  <Switch
                    value={!!topics[t.key]}
                    onValueChange={() => toggleTopic(t.key)}
                    trackColor={{true: COLORS.keystone_gold, false: '#CBD2D9'}}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Rent reminder timing */}
        {topics.rentReminders && (
          <View className="px-4 mt-5">
            <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
              Remind me before rent is due
            </Text>
            <View className="flex-row gap-2">
              {REMIND_DAYS.map(d => {
                const on = reminderDays === d;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => pickDays(d)}
                    activeOpacity={0.85}
                    style={on ? {backgroundColor: COLORS.keystone_navy} : null}
                    className={`flex-1 py-3 rounded-xl items-center ${on ? '' : 'bg-white border border-keystone_hairline'}`}>
                    <Text className={`font-inter-semibold text-sm ${on ? 'text-white' : 'text-keystone_navy'}`}>
                      {d} {d > 1 ? 'days' : 'day'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <Text className="text-text_muted font-inter text-xs text-center mt-6 px-6 leading-5">
          You’ll always get critical notices about your tenancy, even with these
          off.
        </Text>
      </ScrollView>
    </View>
  );
};

export default NotificationPrefs;
