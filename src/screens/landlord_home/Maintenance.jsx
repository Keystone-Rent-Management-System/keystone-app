import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {useMaintenance} from '../../hooks/useMaintenance';
import {Card, IconChip, Label, Amount, Divider, StatusPill, Icon} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Maintenance — supervision, not management. The landlord watches the
// system work: a health hero (resolved / avg time / SLA), a status
// pipeline, and an SLA-aware request board where anything breaching
// its target turns red. He only acts on the red.

const STATUS = {
  OPEN: {label: 'Open', icon: 'reports', tint: COLORS.keystone_slate},
  IN_PROGRESS: {label: 'In progress', icon: 'wrench', tint: COLORS.keystone_navy},
  AWAITING_PARTS: {label: 'Awaiting parts', icon: 'card', tint: COLORS.c_pending},
};
const CATEGORY_ICON = {Plumbing: 'wrench', HVAC: 'wrench', Appliance: 'card'};

const Maintenance = () => {
  const {summary, isPending, isRefetching, refetch} = useMaintenance();
  const requests = summary?.requests ?? [];

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        <View className="px-5 pt-6 pb-3">
          <Text className="text-keystone_navy font-inter-bold text-2xl">Maintenance</Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            You supervise the system — your PM works the queue
          </Text>
        </View>

        {/* Health hero (navy) */}
        <View className="px-4">
          <Card feature>
            <View className="flex-row items-center justify-between">
              <Label onDark>This month</Label>
              <StatusPill
                tone={(summary?.overdue ?? 0) > 0 ? 'danger' : 'success'}
                label={(summary?.overdue ?? 0) > 0 ? `${summary.overdue} overdue` : 'On track'}
              />
            </View>
            <View className="flex-row mt-4">
              <HeroStat value={`${summary?.resolvedThisMonth ?? 0}`} label="Resolved" />
              <View className="w-px bg-white/12" />
              <HeroStat value={`${summary?.avgResolutionDays ?? '—'}d`} label="Avg time" center />
              <View className="w-px bg-white/12" />
              <HeroStat value={`${summary?.slaComplianceRate ?? 0}%`} label="On SLA" right gold />
            </View>
          </Card>
        </View>

        {/* Pipeline */}
        <View className="px-4 mt-4">
          <Card>
            <Label>Active pipeline</Label>
            <View className="flex-row items-center justify-between mt-4">
              <PipeStep count={summary?.openRequests ?? 0} label="Open" icon="reports" tint={COLORS.keystone_slate} />
              <Connector />
              <PipeStep count={summary?.inProgress ?? 0} label="In progress" icon="wrench" tint={COLORS.keystone_navy} />
              <Connector />
              <PipeStep count={summary?.awaitingParts ?? 0} label="Awaiting parts" icon="card" tint={COLORS.c_pending} />
            </View>
          </Card>
        </View>

        {/* Request board */}
        <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-5 mt-6 mb-3">
          Request board
        </Text>
        {requests.map(r => (
          <View key={r.id} className="px-4 mb-3">
            <RequestCard r={r} />
          </View>
        ))}
        {requests.length === 0 && !isPending && (
          <Text className="text-c_success font-inter text-sm text-center py-8 px-4">
            ✓ No active requests — nothing needs watching.
          </Text>
        )}

        {isPending && (
          <View className="items-center justify-center py-8">
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const RequestCard = ({r}) => {
  const st = STATUS[r.status] ?? STATUS.OPEN;
  const overdue = r.ageDays > r.slaDays;
  const frac = Math.min(1, r.ageDays / Math.max(1, r.slaDays));
  const barColor = overdue ? COLORS.c_danger : frac > 0.7 ? COLORS.c_pending : COLORS.c_success;
  return (
    <Card style={overdue ? {borderLeftWidth: 3, borderLeftColor: COLORS.c_danger} : null}>
      <View className="flex-row items-center">
        <IconChip size={40}>
          <Icon name={CATEGORY_ICON[r.category] ?? 'wrench'} size={18} />
        </IconChip>
        <View className="flex-1 ml-3">
          <Text className="text-keystone_navy font-inter-semibold text-base">{r.unitName}</Text>
          <Text className="text-text_muted font-inter text-xs mt-0.5">{r.issue}</Text>
        </View>
        <StatusPill tone={overdue ? 'danger' : r.status === 'AWAITING_PARTS' ? 'pending' : 'neutral'} label={st.label} />
      </View>

      {/* SLA age bar */}
      <View className="mt-3">
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-text_muted font-inter text-2xs uppercase tracking-wider">
            {r.assignedTo ?? 'Unassigned'}
          </Text>
          <Text style={{color: barColor}} className="font-inter-semibold text-2xs">
            {overdue ? `${r.ageDays - r.slaDays}d over SLA` : `day ${r.ageDays} of ${r.slaDays}`}
          </Text>
        </View>
        <View className="h-1.5 rounded-full overflow-hidden" style={{backgroundColor: 'rgba(21,37,53,0.07)'}}>
          <View style={{width: `${frac * 100}%`, backgroundColor: barColor}} className="h-1.5 rounded-full" />
        </View>
      </View>
    </Card>
  );
};

const HeroStat = ({value, label, center, right, gold}) => (
  <View style={{flex: 1, alignItems: right ? 'flex-end' : center ? 'center' : 'flex-start'}}>
    <Text style={{color: gold ? COLORS.keystone_gold : '#FFFFFF'}} className="font-inter-bold text-2xl">
      {value}
    </Text>
    <Text className="text-white/55 font-inter-medium text-2xs uppercase tracking-wider mt-1">{label}</Text>
  </View>
);

const PipeStep = ({count, label, icon, tint}) => (
  <View className="items-center" style={{flex: 1}}>
    <View style={{backgroundColor: COLORS.keystone_chip}} className="w-12 h-12 rounded-2xl items-center justify-center">
      <Icon name={icon} size={20} color={tint} />
    </View>
    <Text className="text-keystone_navy font-inter-bold text-lg mt-2">{count}</Text>
    <Text className="text-text_muted font-inter text-2xs text-center">{label}</Text>
  </View>
);

const Connector = () => (
  <View style={{flex: 0.4, height: 1, backgroundColor: COLORS.keystone_hairline, marginTop: -22}} />
);

export default Maintenance;
