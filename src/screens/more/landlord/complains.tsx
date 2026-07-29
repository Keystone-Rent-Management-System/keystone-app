import moment from 'moment';
import React from 'react';
import {StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Card, Icon, IconChip} from '../../../components/premium';
import {PrimaryButton, Screen, StatusChip} from '../../../components/kit';
import COLORS from '../../../constants/Theme';

// Your messages (design 8f). Route more__complains survives as the
// message history under Help & contact — the standalone legacy-blue
// Complaints screen is retired. Rows verb-date the lifecycle
// (sent → resolved, D2) with standard chips; the repair-triage link
// keeps plumbing issues out of free-text messages.

interface IMessage {
  sentOn: Date;
  resolvedOn?: Date | null;
  title: string;
  status: 'IN_PROGRESS' | 'RESOLVED';
}

const messages: IMessage[] = [
  {
    sentOn: moment().subtract(3, 'days').toDate(),
    title:
      'The upstairs neighbors are too loud late at night. It’s hard to sleep with all the stomping and music.',
    status: 'IN_PROGRESS',
  },
  {
    sentOn: moment().subtract(12, 'days').toDate(),
    title:
      'The air conditioning is not working properly. It’s too hot in the apartment.',
    status: 'IN_PROGRESS',
  },
  {
    sentOn: moment().subtract(50, 'days').toDate(),
    resolvedOn: moment().subtract(43, 'days').toDate(),
    title:
      'The water heater is broken and needs to be fixed. It’s been out for a week now.',
    status: 'RESOLVED',
  },
  {
    sentOn: moment().subtract(100, 'days').toDate(),
    resolvedOn: moment().subtract(93, 'days').toDate(),
    title:
      'The hallways haven’t been cleaned in weeks. There’s dirt and trash piling up',
    status: 'RESOLVED',
  },
];

const fmt = (d: Date) => moment(d).format('MMM D');

export default function Messages() {
  const nav = useNavigation<any>();

  return (
    <Screen title="Your messages" back="Help">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {/* One grouped card, hairline-separated rows; the chip rides the
          top line beside the message (8f) */}
      <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
        {messages.map((m, i) => (
          <View
            key={i}
            className="flex-row items-start gap-3"
            style={{
              paddingVertical: 14,
              borderBottomWidth: i < messages.length - 1 ? 1 : 0,
              borderBottomColor: 'rgba(21,37,53,0.08)',
            }}>
            <IconChip size={40}>
              <Icon name="chat" size={18} color={COLORS.keystone_gold} />
            </IconChip>
            <View className="flex-1" style={{minWidth: 0}}>
              <View className="flex-row items-start gap-2">
                <Text
                  className="flex-1 text-keystone_navy font-inter-semibold"
                  style={{fontSize: 15, lineHeight: 21, minWidth: 0}}>
                  {m.title}
                </Text>
                <View style={{flexShrink: 0, maxWidth: '42%'}}>
                  <StatusChip
                    label={m.status === 'RESOLVED' ? 'Resolved' : 'In progress'}
                    tone={m.status === 'RESOLVED' ? 'success' : 'pending'}
                  />
                </View>
              </View>
              {/* D2: verb-dated lifecycle */}
              <Text className="text-keystone_slate font-inter text-[13px] mt-1">
                Sent {fmt(m.sentOn)}
                {m.resolvedOn
                  ? ` · resolved ${fmt(m.resolvedOn)}`
                  : ' · to Keystone Property Group'}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Repair triage — keeps plumbing out of free-text messages */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => nav.navigate('my_home_stack', {screen: 'repairs'})}>
        <Text className="text-keystone_slate font-inter text-xs mt-2 ml-1 leading-5">
          Something broken in your unit?{' '}
          <Text className="text-keystone_navy font-inter-semibold underline">
            Report a repair instead
          </Text>{' '}
          — it gets a vendor and a timeline.
        </Text>
      </TouchableOpacity>

      <PrimaryButton
        label="New message"
        style={{marginTop: 16}}
        onPress={() => nav.navigate('help')}
      />
    </Screen>
  );
}
