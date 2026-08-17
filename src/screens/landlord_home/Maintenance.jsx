import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {useMaintenance} from '../../hooks/useMaintenance';
import {Card, IconChip, Icon} from '../../components/premium';
import {
  PhotoCountChip,
  Screen,
  SectionLabel,
  StatusChip,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Landlord Maintenance — read-only supervision (design 4k).
// Exceptions first: the NEEDS ATTENTION group with the reassurance
// sub-line, then open items consuming tenant requests 1:1 — same
// chips, same photo counts (P5). No action buttons: the landlord
// watches the system work and only acts on the red.

const STATUS = {
  OPEN: {label: 'New', tone: 'neutral'},
  IN_PROGRESS: {label: 'In progress', tone: 'pending'},
  AWAITING_PARTS: {label: 'Awaiting parts', tone: 'pending'},
};

const Maintenance = () => {
  const {summary, isPending, isRefetching, refetch, error, loaded} =
    useMaintenance();
  // Only a successful load may say the queue is clear; a failed request
  // also produces an empty list.
  const canReassure = loaded && !error;
  const requests = summary?.requests ?? [];
  const overdueReqs = requests.filter(r => r.ageDays > r.slaDays);
  const activeReqs = requests.filter(r => r.ageDays <= r.slaDays);

  return (
    <Screen
      loadError={!isPending && error}
      onRetry={refetch}
      title="Maintenance"
      back="Reports"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {/* Counts card — white, not navy: maintenance isn't money (F3).
          During a failure every count resolved to 0, which reads as a
          clear queue rather than an unknown one. Show em dashes. */}
      <Card>
        <View className="flex-row">
          <CountStat value={canReassure ? `${requests.length}` : '—'} label="Open" />
          <View style={{width: 1, backgroundColor: COLORS.keystone_hairline}} />
          <CountStat
            value={canReassure ? `${summary?.overdue ?? overdueReqs.length}` : '—'}
            label="Overdue"
            danger
          />
          <View style={{width: 1, backgroundColor: COLORS.keystone_hairline}} />
          <CountStat
            value={canReassure ? `${summary?.resolvedThisMonth ?? 0}` : '—'}
            label="Resolved · 30d"
          />
        </View>
      </Card>

      {/* NEEDS ATTENTION — exceptions first */}
      {overdueReqs.length > 0 && (
        <View className="mt-5">
          <SectionLabel>Needs attention · {overdueReqs.length}</SectionLabel>
          {overdueReqs.map(r => (
            <Card key={r.id} style={{marginBottom: 12}}>
              <View className="flex-row items-center" style={{minWidth: 0}}>
                <View
                  style={{backgroundColor: 'rgba(229,53,53,0.10)'}}
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                  <Icon name="wrench" size={18} color={COLORS.c_danger} />
                </View>
                <View className="flex-1" style={{minWidth: 0}}>
                  <Text
                    numberOfLines={1}
                    className="text-keystone_navy font-inter-semibold text-base">
                    {r.issue} — {r.unitName}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-text_muted font-inter text-xs mt-0.5">
                    {r.assignedTo ?? 'Unassigned'} ·{' '}
                    {r.ageDays - r.slaDays}d over SLA
                  </Text>
                </View>
                <View style={{flexShrink: 0, maxWidth: '40%'}}>
                  <StatusChip label="Overdue" tone="danger" />
                </View>
              </View>
              {/* Reassurance — the system already escalated */}
              <Text className="text-keystone_slate font-inter text-xs mt-3">
                Your PM has been notified. Escalated automatically after{' '}
                {r.slaDays} days.
              </Text>
            </Card>
          ))}
        </View>
      )}

      {/* Active pipeline */}
      <View className="mt-4">
        <SectionLabel>
          {/* Also a count: "Open · 0" during a failure reads as a clear
              queue. */}
          Open · {canReassure ? activeReqs.length : '—'}
        </SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {activeReqs.map((r, i) => {
            const st = STATUS[r.status] ?? STATUS.OPEN;
            return (
              <View
                key={r.id}
                className="flex-row items-center py-3.5"
                style={
                  i < activeReqs.length - 1 && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: COLORS.keystone_hairline,
                  }
                }>
                <IconChip size={40}>
                  <Icon name="wrench" size={18} color={COLORS.keystone_gold} />
                </IconChip>
                <View className="flex-1 ml-3" style={{minWidth: 0}}>
                  <Text
                    numberOfLines={1}
                    className="text-keystone_navy font-inter-semibold text-sm">
                    {r.issue} — {r.unitName}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-0.5">
                    <Text
                      numberOfLines={1}
                      className="text-text_muted font-inter text-xs"
                      style={{flexShrink: 1}}>
                      {r.assignedTo ?? 'Assigning vendor'} · day {r.ageDays} of{' '}
                      {r.slaDays}
                    </Text>
                    {r.photos ? <PhotoCountChip count={r.photos} /> : null}
                  </View>
                </View>
                <View style={{flexShrink: 0, maxWidth: '40%'}}>
                  <StatusChip label={st.label} tone={st.tone} />
                </View>
              </View>
            );
          })}
          {activeReqs.length === 0 && !isPending && (
            <Text
              className={`font-inter text-sm text-center py-6 ${
                canReassure ? 'text-c_success' : 'text-keystone_slate'
              }`}>
              {canReassure
                ? '✓ No active requests — nothing needs watching.'
                : 'We couldn’t load your maintenance queue. Don’t treat this as clear.'}
            </Text>
          )}
        </Card>
      </View>

      {isPending && (
        <View className="items-center justify-center py-8">
          <ActivityIndicator color={COLORS.keystone_navy} />
        </View>
      )}
    </Screen>
  );
};

// 4k counts row — label above the number; overdue carries the only
// semantic color on the card.
const CountStat = ({value, label, danger}) => (
  <View style={{flex: 1, paddingHorizontal: 4}}>
    <Text
      numberOfLines={1}
      className="font-inter-semibold text-2xs uppercase tracking-wider"
      style={{color: danger ? COLORS.c_danger_text ?? '#B32020' : COLORS.keystone_slate}}>
      {label}
    </Text>
    <Text
      className="font-inter-bold text-2xl mt-1"
      style={{
        color: danger ? '#B32020' : COLORS.keystone_navy,
        fontVariant: ['tabular-nums'],
      }}>
      {value}
    </Text>
  </View>
);

export default Maintenance;
