import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantRepairs} from '../../hooks/useTenantHome';
import {Card, IconChip, Icon, StatusPill} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Repairs — the tenant reports an issue; it feeds the landlord's
// read-only maintenance view. List + status, with a prominent "report".

const TONE = {
  SUBMITTED: 'pending',
  IN_PROGRESS: 'pending',
  SCHEDULED: 'pending',
  RESOLVED: 'success',
};
const LABEL = {
  SUBMITTED: 'Submitted',
  IN_PROGRESS: 'In progress',
  SCHEDULED: 'Scheduled',
  RESOLVED: 'Resolved',
};

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
};

const Repairs = () => {
  const nav = useNavigation();
  const {repairs, isPending, isRefetching, refetch} = useTenantRepairs();

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Report CTA */}
        <View className="px-4 pt-5">
          <TouchableOpacity activeOpacity={0.9} onPress={() => nav.navigate('report_repair')}>
            <Card feature>
              <View className="flex-row items-center">
                <View
                  style={{backgroundColor: 'rgba(255,255,255,0.10)'}}
                  className="w-11 h-11 rounded-xl items-center justify-center mr-3">
                  <Icon name="wrench" size={20} color={COLORS.keystone_gold} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-inter-bold text-base">
                    Report a repair
                  </Text>
                  <Text className="text-white/60 font-inter text-xs mt-0.5">
                    Add a photo — your landlord is notified instantly.
                  </Text>
                </View>
                <Text className="text-white/70 font-inter-semibold text-lg">›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* List */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Your requests
          </Text>
          {isPending ? (
            <Text className="text-text_muted font-inter text-sm ml-1">Loading…</Text>
          ) : repairs.length === 0 ? (
            <Card>
              <Text className="text-text_muted font-inter text-sm">
                No repairs reported. Tap “Report a repair” if something needs
                fixing.
              </Text>
            </Card>
          ) : (
            repairs.map(r => (
              <TouchableOpacity
                key={r.id}
                activeOpacity={0.85}
                onPress={() => nav.navigate('repair_detail', {repair: r})}
                className="mb-3">
                <Card>
                  <View className="flex-row items-center gap-3">
                    <IconChip size={42}>
                      <Icon name="wrench" size={19} color={COLORS.keystone_gold} />
                    </IconChip>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-keystone_navy font-inter-semibold text-sm">
                          {r.title}
                        </Text>
                        {r.priority === 'URGENT' && r.status !== 'RESOLVED' && (
                          <StatusPill label="Urgent" tone="danger" />
                        )}
                      </View>
                      <Text className="text-text_muted font-inter text-xs mt-0.5">
                        {r.category} · {fmtDate(r.submittedOn)}
                        {r.assignedTo ? ` · ${r.assignedTo}` : ''}
                      </Text>
                    </View>
                    <StatusPill label={LABEL[r.status] ?? r.status} tone={TONE[r.status] ?? 'neutral'} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Repairs;
