import React from 'react';
import {ScrollView, StatusBar, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';

import {Card, Label, Divider, Row, StatusPill} from '../../components/premium';
import COLORS from '../../constants/Theme';

const TONE = {SUBMITTED: 'pending', IN_PROGRESS: 'pending', SCHEDULED: 'pending', RESOLVED: 'success'};
const LABEL = {SUBMITTED: 'Submitted', IN_PROGRESS: 'In progress', SCHEDULED: 'Scheduled', RESOLVED: 'Resolved'};

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
};

const RepairDetail = () => {
  const {params = {}} = useRoute();
  const r = params.repair ?? {};
  const timeline = r.timeline ?? [];

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView contentContainerStyle={{paddingBottom: 28}} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <View className="flex-row items-center justify-between">
              <Label onDark>{r.category}</Label>
              <StatusPill label={LABEL[r.status] ?? r.status} tone={TONE[r.status] ?? 'neutral'} />
            </View>
            <Text className="text-white font-inter-bold text-xl mt-2">{r.title}</Text>
            <Text className="text-white/55 font-inter text-xs mt-1">
              Reported {fmtDate(r.submittedOn)}
              {r.photos ? ` · ${r.photos} photo${r.photos > 1 ? 's' : ''}` : ''}
            </Text>
          </Card>
        </View>

        {/* Details */}
        <View className="px-4 mt-4">
          <Card>
            <Row label="Assigned to" value={r.assignedTo ?? 'Pending'} />
            <Divider />
            <Row label="Last update" value={fmtDate(r.updatedOn)} />
          </Card>
        </View>

        {/* Timeline */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Progress
          </Text>
          <Card>
            {timeline.map((t, i) => (
              <View key={i} className="flex-row">
                {/* rail */}
                <View className="items-center mr-3" style={{width: 18}}>
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: t.done ? COLORS.c_success : '#CBD2D9',
                      marginTop: 4,
                    }}
                  />
                  {i < timeline.length - 1 && (
                    <View className="flex-1 w-0.5" style={{backgroundColor: COLORS.keystone_hairline, marginVertical: 2}} />
                  )}
                </View>
                <View className="flex-1 pb-4">
                  <Text
                    className={`font-inter-semibold text-sm ${t.done ? 'text-keystone_navy' : 'text-text_muted'}`}>
                    {t.label}
                  </Text>
                  <Text className="text-text_muted font-inter text-xs mt-0.5">
                    {fmtDate(t.date)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default RepairDetail;
