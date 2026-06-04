import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useComplianceAlerts, useSendComplianceNotice} from '../../hooks/useCompliance';
import {Card, IconChip, Label, Divider, StatusPill} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Compliance alerts — Washington-first (CEO override on Strategic
// Playbook scope). One tap generates the statutory notice,
// dispatches it, and logs to the audit trail.

const Compliance = () => {
  const {alerts, isPending, isRefetching, refetch} = useComplianceAlerts();
  const sendMut = useSendComplianceNotice();
  const pending = alerts.filter(a => a.status === 'NOT_SENT');

  const handleSendAll = () => {
    if (pending.length === 0) return;
    Alert.alert(
      'Send all pending notices?',
      `${pending.length} notice${pending.length === 1 ? '' : 's'} will be generated, dispatched, and logged to the audit trail.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Send all', onPress: () => pending.forEach(a => sendMut.mutate(a.id))},
      ],
    );
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
        <View className="px-5 pt-6 pb-4">
          <Text className="text-keystone_navy font-inter-bold text-2xl">Compliance</Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            {pending.length > 0
              ? `${pending.length} notice${pending.length === 1 ? '' : 's'} require your action`
              : 'Your audit trail is current'}
          </Text>
        </View>

        {alerts.length === 0 && !isPending && (
          <Text className="text-c_success font-inter text-sm text-center py-10">
            ✓ No pending notices.
          </Text>
        )}

        {alerts.map(a => (
          <View key={a.id} className="px-4 mb-3">
            <Card
              style={
                a.status === 'NOT_SENT'
                  ? {borderLeftWidth: 3, borderLeftColor: COLORS.c_pending}
                  : null
              }>
              <View className="flex-row items-center gap-3">
                <View
                  style={{backgroundColor: 'rgba(205,160,0,0.12)'}}
                  className="w-10 h-10 rounded-lg items-center justify-center">
                  <Text style={{color: COLORS.c_pending, fontWeight: '700'}}>⚖</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-keystone_navy font-inter-semibold text-base">
                    {a.unitName}
                  </Text>
                  <Text className="text-text_muted font-inter text-xs mt-0.5">
                    {a.title}
                  </Text>
                </View>
                <StatusPill tone="neutral" label={`${a.jurisdiction} · ${a.regulation}`} />
              </View>

              <Divider style={{marginVertical: 12}} />
              <View className="flex-row items-center justify-between">
                <Text className="text-text_muted font-inter text-xs">
                  Deadline {formatDate(a.deadline)}
                </Text>
                {a.status === 'SENT' && (
                  <Text className="text-c_success font-inter-semibold text-xs">
                    ✓ Sent & logged
                  </Text>
                )}
              </View>

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
            </Card>
          </View>
        ))}

        {pending.length > 1 && (
          <View className="px-4 mt-2">
            <TouchableOpacity
              onPress={handleSendAll}
              disabled={sendMut.isPending}
              activeOpacity={0.85}
              className="border border-keystone_navy rounded-2xl p-4 items-center">
              <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wider">
                Send all pending notices
              </Text>
            </TouchableOpacity>
            <Text className="text-text_muted font-inter text-2xs text-center mt-3 px-4">
              Notices use statute-sourced templates, dispatched via
              certified-mail-digital, logged with timestamp to your audit trail.
            </Text>
          </View>
        )}

        {isPending && (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const formatDate = iso => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
  } catch {
    return iso;
  }
};

export default Compliance;
