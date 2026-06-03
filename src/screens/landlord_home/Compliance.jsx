import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useComplianceAlerts,
  useSendComplianceNotice,
} from '../../hooks/useCompliance';

// Compliance alerts — Washington-first (CEO override on Strategic
// Playbook Year-1 scope). One tap generates the statutory notice,
// dispatches via certified-mail-digital, and logs to the audit
// trail. The landlord never reasons about which form to send.

const Compliance = () => {
  const {alerts, isPending, isRefetching, refetch} = useComplianceAlerts();
  const sendMut = useSendComplianceNotice();

  const handleSendAll = () => {
    const pending = alerts.filter(a => a.status === 'NOT_SENT');
    if (pending.length === 0) return;
    Alert.alert(
      'Send all pending notices?',
      `${pending.length} notice${pending.length === 1 ? '' : 's'} will be generated, dispatched, and logged to the audit trail. This action is recorded.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Send all',
          style: 'default',
          onPress: () => {
            pending.forEach(a => sendMut.mutate(a.id));
          },
        },
      ],
    );
  };

  const pendingCount = alerts.filter(a => a.status === 'NOT_SENT').length;

  return (
    <ScrollView
      className="flex-1 bg-keystone_stone"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }>
      {/* Banner */}
      <View className="px-5 pt-6 pb-2 flex-row items-center gap-2">
        <Text className="text-keystone_gold font-inter text-base">⚠</Text>
        <Text className="text-keystone_navy font-inter-semibold text-base uppercase tracking-wide">
          Compliance Alerts
        </Text>
        <Text className="text-keystone_gold font-inter text-base">⚠</Text>
      </View>

      {pendingCount > 0 && (
        <Text className="mx-5 mt-2 text-grey_1 font-inter text-sm">
          {pendingCount} notice{pendingCount === 1 ? '' : 's'} require your action
        </Text>
      )}

      {/* Alert cards */}
      <View className="mt-4">
        {alerts.length === 0 && !isPending && (
          <Text className="text-[#22C55E] font-inter text-sm text-center py-10">
            ✓ No pending notices. Your audit trail is current.
          </Text>
        )}
        {alerts.map(a => (
          <View
            key={a.id}
            className="mx-4 mb-3 bg-white rounded-2xl p-4 border-l-4 border-keystone_gold shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-keystone_navy font-inter-semibold text-base flex-1">
                {a.unitName}
              </Text>
              <View className="bg-keystone_gold/20 px-2 py-1 rounded">
                <Text className="text-keystone_navy font-inter-semibold text-xs">
                  {a.jurisdiction} · {a.regulation}
                </Text>
              </View>
            </View>
            <Text className="text-grey_1 font-inter text-sm mt-2">
              {a.title}
            </Text>
            <Text className="text-grey_1 font-inter text-xs mt-1">
              Deadline: {formatDate(a.deadline)}
            </Text>
            {a.status === 'NOT_SENT' && (
              <TouchableOpacity
                onPress={() => sendMut.mutate(a.id)}
                disabled={sendMut.isPending}
                activeOpacity={0.85}
                className="mt-3 bg-keystone_navy rounded-xl p-3 items-center">
                <Text className="text-white font-inter-semibold text-xs uppercase tracking-wider">
                  {a.actionLabel ?? 'Send notice'}
                </Text>
              </TouchableOpacity>
            )}
            {a.status === 'SENT' && (
              <Text className="mt-3 text-[#22C55E] font-inter-semibold text-xs">
                ✓ Sent & logged to audit trail
              </Text>
            )}
          </View>
        ))}
      </View>

      {pendingCount > 1 && (
        <View className="px-4 mt-3 mb-12">
          <TouchableOpacity
            onPress={handleSendAll}
            disabled={sendMut.isPending}
            activeOpacity={0.85}
            className="rounded-2xl p-4 items-center border border-keystone_navy">
            <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wider">
              Send all pending notices now
            </Text>
          </TouchableOpacity>
          <Text className="text-grey_1 font-inter text-xs text-center mt-3 px-4">
            Notices are generated using statute-sourced templates,
            dispatched via certified-mail-digital, and logged with
            timestamp to your audit trail.
          </Text>
        </View>
      )}

      {isPending && (
        <View className="absolute inset-0 items-center justify-center bg-white/60">
          <ActivityIndicator color="#152535" />
        </View>
      )}
    </ScrollView>
  );
};

const formatDate = iso => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

export default Compliance;
