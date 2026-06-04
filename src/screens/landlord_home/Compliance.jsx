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
import {
  useComplianceAlerts,
  useComplianceAudit,
  useSendComplianceNotice,
} from '../../hooks/useCompliance';
import {Card, IconChip, Label, Divider, StatusPill, Icon, Ring} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Compliance — make it feel like protection, not a chore. A health
// ring shows how covered he is, action-needed notices carry deadline
// countdowns, and an audit-trail timeline is the timestamped proof
// every required notice went out.

const daysLeft = iso => {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
};

const Compliance = () => {
  const {alerts, isPending, isRefetching, refetch} = useComplianceAlerts();
  const {audit} = useComplianceAudit();
  const sendMut = useSendComplianceNotice();

  const pending = alerts.filter(a => a.status === 'NOT_SENT');
  const overdue = pending.filter(a => (daysLeft(a.deadline) ?? 1) < 0);
  const handled = audit.length;
  const health =
    handled + pending.length === 0
      ? 100
      : Math.round((handled / (handled + pending.length)) * 100);
  const protectedNow = overdue.length === 0;

  const handleSendAll = () => {
    if (pending.length === 0) return;
    Alert.alert(
      'Send all pending notices?',
      `${pending.length} notice${pending.length === 1 ? '' : 's'} will be generated, dispatched, and logged to your audit trail.`,
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
        <View className="px-5 pt-6 pb-3">
          <Text className="text-keystone_navy font-inter-bold text-2xl">Compliance</Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Washington · every notice handled and logged
          </Text>
        </View>

        {/* Protection hero (navy) */}
        <View className="px-4">
          <Card feature>
            <View className="flex-row items-center">
              <Ring
                percent={health}
                size={96}
                thickness={10}
                color={protectedNow ? COLORS.c_success : COLORS.c_pending}
                trackColor="rgba(255,255,255,0.12)"
                centerValue={`${health}%`}
                centerColor="#FFFFFF"
              />
              <View className="flex-1 ml-4">
                <View className="flex-row items-center gap-2">
                  <View
                    style={{backgroundColor: protectedNow ? COLORS.c_success : COLORS.c_pending}}
                    className="w-2 h-2 rounded-full"
                  />
                  <Text className="text-white font-inter-bold text-xl">
                    {protectedNow ? 'Protected' : 'Action needed'}
                  </Text>
                </View>
                <Text className="text-white/60 font-inter text-xs mt-1.5 leading-4">
                  {protectedNow
                    ? 'No overdue notices. Your audit trail is current.'
                    : `${overdue.length} notice${overdue.length === 1 ? '' : 's'} past deadline.`}
                </Text>
              </View>
            </View>
            <Divider onDark style={{marginTop: 16, marginBottom: 14}} />
            <View className="flex-row">
              <MiniStat value={handled} label="Notices logged" />
              <View className="w-px bg-white/12" />
              <MiniStat value={pending.length} label="Pending" center />
              <View className="w-px bg-white/12" />
              <MiniStat value={overdue.length} label="Overdue" right />
            </View>
          </Card>
        </View>

        {/* Action needed */}
        {pending.length > 0 && (
          <>
            <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-5 mt-6 mb-3">
              Action needed
            </Text>
            {pending.map(a => {
              const dl = daysLeft(a.deadline);
              const urgent = (dl ?? 99) <= 14;
              const tint = dl < 0 ? COLORS.c_danger : urgent ? COLORS.c_pending : COLORS.keystone_navy;
              const frac = Math.max(0.05, Math.min(1, 1 - (dl ?? 0) / 90));
              return (
                <View key={a.id} className="px-4 mb-3">
                  <Card style={{borderLeftWidth: 3, borderLeftColor: tint}}>
                    <View className="flex-row items-center">
                      <View style={{backgroundColor: 'rgba(205,160,0,0.12)'}} className="w-10 h-10 rounded-lg items-center justify-center">
                        <Icon name="scale" size={19} color={COLORS.c_pending} />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-keystone_navy font-inter-semibold text-base">{a.unitName}</Text>
                        <Text className="text-text_muted font-inter text-xs mt-0.5">{a.title}</Text>
                      </View>
                      <StatusPill tone="neutral" label={`${a.jurisdiction} · ${a.regulation}`} />
                    </View>

                    {/* deadline countdown */}
                    <View className="mt-3">
                      <View className="flex-row items-center justify-between mb-1.5">
                        <Text className="text-text_muted font-inter text-2xs uppercase tracking-wider">
                          Deadline {formatDate(a.deadline)}
                        </Text>
                        <Text style={{color: tint}} className="font-inter-semibold text-2xs">
                          {dl < 0 ? `${Math.abs(dl)}d overdue` : `${dl} days left`}
                        </Text>
                      </View>
                      <View className="h-1.5 rounded-full overflow-hidden" style={{backgroundColor: 'rgba(21,37,53,0.07)'}}>
                        <View style={{width: `${frac * 100}%`, backgroundColor: tint}} className="h-1.5 rounded-full" />
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => sendMut.mutate(a.id)}
                      disabled={sendMut.isPending}
                      activeOpacity={0.85}
                      className="mt-3 bg-keystone_navy rounded-xl p-3 items-center">
                      <Text className="text-white font-inter-semibold text-xs uppercase tracking-wider">
                        {a.actionLabel ?? 'Send notice'}
                      </Text>
                    </TouchableOpacity>
                  </Card>
                </View>
              );
            })}
            {pending.length > 1 && (
              <View className="px-4 mt-1">
                <TouchableOpacity
                  onPress={handleSendAll}
                  disabled={sendMut.isPending}
                  activeOpacity={0.85}
                  className="border border-keystone_navy rounded-2xl p-3.5 items-center">
                  <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wider">
                    Send all pending now
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Audit trail timeline */}
        {audit.length > 0 && (
          <>
            <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-5 mt-6 mb-3">
              Audit trail · proof it happened
            </Text>
            <View className="px-4">
              <Card>
                {audit.map((e, i) => (
                  <View key={e.id} className="flex-row">
                    {/* timeline rail */}
                    <View className="items-center mr-3" style={{width: 18}}>
                      <View className="w-2.5 h-2.5 rounded-full bg-c_success mt-1.5" />
                      {i < audit.length - 1 && (
                        <View style={{flex: 1, width: 1.5, backgroundColor: COLORS.keystone_hairline, marginTop: 2}} />
                      )}
                    </View>
                    <View className="flex-1 pb-4">
                      <Text className="text-keystone_navy font-inter-semibold text-sm">{e.action}</Text>
                      <Text className="text-text_muted font-inter text-xs mt-0.5">
                        {e.unitName} · {e.regulation}
                      </Text>
                      <Text className="text-text_muted font-inter text-2xs mt-1">
                        Logged {e.daysAgo === 0 ? 'today' : `${e.daysAgo}d ago`} · {e.jurisdiction}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          </>
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

const MiniStat = ({value, label, center, right}) => (
  <View style={{flex: 1, alignItems: right ? 'flex-end' : center ? 'center' : 'flex-start'}}>
    <Text className="text-white font-inter-bold text-xl">{value}</Text>
    <Text className="text-white/55 font-inter-medium text-2xs uppercase tracking-wider mt-1">
      {label}
    </Text>
  </View>
);

const formatDate = iso => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  } catch {
    return iso;
  }
};

export default Compliance;
