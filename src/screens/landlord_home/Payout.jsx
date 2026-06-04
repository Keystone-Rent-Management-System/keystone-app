import React, {useState} from 'react';
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
import {useAutoPayout, usePayoutBalance, useSendToBank} from '../../hooks/usePayout';
import {usd, usdCents} from '../../utils/money';
import {Card, IconChip, Label, Amount, AnimatedAmount, Divider, Icon, StatusPill} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Instant Payout — answers "what does Send to bank now mean?" by
// telling the whole money story:
//   tenants pay → lands in your Keystone balance → some is still
//   clearing → the rest is available to sweep to YOUR bank, instantly,
//   whenever you want (vs competitors' scheduled payouts).

const CADENCES = [
  {key: 'DAILY_6AM', label: 'Daily', sub: '6 AM every day'},
  {key: 'WEEKLY_MON', label: 'Weekly', sub: 'Mondays'},
  {key: 'MONTHLY_1ST', label: 'Monthly', sub: 'On the 1st'},
];

const Payout = () => {
  const {balance, isPending, isRefetching, refetch} = usePayoutBalance();
  const sendMut = useSendToBank();
  const autoMut = useAutoPayout();

  const [localAuto, setLocalAuto] = useState({
    enabled: balance?.autoPayout?.enabled ?? false,
    cadence: balance?.autoPayout?.cadence ?? null,
  });
  React.useEffect(() => {
    if (balance?.autoPayout) {
      setLocalAuto({enabled: !!balance.autoPayout.enabled, cadence: balance.autoPayout.cadence});
    }
  }, [balance?.autoPayout?.enabled, balance?.autoPayout?.cadence]);

  const handleSend = () => {
    if (!balance?.available) return;
    Alert.alert(
      'Send to bank now?',
      `${usdCents(balance.available)} moves from your Keystone balance to ${
        balance?.bank?.name ?? 'your bank'
      } ····${balance?.bank?.accountLast4 ?? ''} via FedNow — arrives in seconds.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Send', onPress: () => sendMut.mutate(balance.available)},
      ],
    );
  };

  const pickCadence = key => {
    const next = {enabled: true, cadence: key};
    setLocalAuto(next);
    autoMut.mutate(next);
  };
  const disableAuto = () => {
    const next = {enabled: false, cadence: null};
    setLocalAuto(next);
    autoMut.mutate(next);
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
        {/* What this is */}
        <View className="px-5 pt-5 pb-2">
          <Text className="text-keystone_navy font-inter-bold text-2xl">Your money</Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Rent your tenants pay lands in your Keystone balance. Move it to
            your own bank the moment you want — in seconds, not days.
          </Text>
        </View>

        {/* Money-flow breakdown (navy feature) */}
        <View className="px-4 mt-2">
          <Card feature>
            <Label onDark>Available to send now</Label>
            <AnimatedAmount value={balance?.available ?? 0} format={usdCents} size="xl" onDark style={{marginTop: 8, color: COLORS.keystone_gold}} />

            {/* flow chips */}
            <View className="flex-row mt-5">
              <FlowCell label="Collected" value={usd(balance?.collectedThisMonth ?? 0)} sub="this month" />
              <Icon name="trending" size={14} color="rgba(255,255,255,0.4)" />
              <FlowCell label="Clearing" value={usd(balance?.clearing ?? 0)} sub="settling" align="center" />
              <Icon name="trending" size={14} color="rgba(255,255,255,0.4)" />
              <FlowCell label="Available" value={usd(balance?.available ?? 0)} sub="ready" align="right" gold />
            </View>

            <TouchableOpacity
              onPress={handleSend}
              disabled={sendMut.isPending || !balance?.available}
              activeOpacity={0.85}
              className="bg-keystone_gold rounded-2xl p-4 items-center mt-6">
              {sendMut.isPending ? (
                <ActivityIndicator color={COLORS.keystone_navy} />
              ) : (
                <Text className="text-keystone_navy font-inter-bold text-base uppercase tracking-wider">
                  Send to bank now
                </Text>
              )}
            </TouchableOpacity>
            <View className="flex-row items-center justify-center gap-2 mt-3">
              <View className="w-1.5 h-1.5 rounded-full bg-keystone_gold" />
              <Text className="text-white/55 font-inter text-2xs">
                FedNow · arrives in under 60s · no fee
              </Text>
            </View>
          </Card>
        </View>

        {/* Destination bank */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center">
              <IconChip size={44}><Icon name="bank" size={20} /></IconChip>
              <View className="flex-1 ml-3">
                <Label>Destination</Label>
                <Text className="text-keystone_navy font-inter-semibold text-base mt-0.5">
                  {balance?.bank?.name ?? 'Bank account'} ····{balance?.bank?.accountLast4 ?? '—'}
                </Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-keystone_gold font-inter-semibold text-sm">Change</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* In transit */}
        {balance?.inTransit?.amount > 0 && (
          <View className="px-4 mt-4">
            <Card style={{borderLeftWidth: 3, borderLeftColor: COLORS.keystone_gold}}>
              <View className="flex-row items-center">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color={COLORS.keystone_gold} />
                    <Label>On its way</Label>
                  </View>
                  <Text className="text-keystone_navy font-inter-bold text-xl mt-1">
                    {usdCents(balance.inTransit.amount)}
                  </Text>
                  <Text className="text-text_muted font-inter text-xs mt-0.5">
                    to {balance?.bank?.name} · ETA ~{balance.inTransit.etaSeconds}s
                  </Text>
                </View>
                <StatusPill tone="pending" label="Processing" />
              </View>
            </Card>
          </View>
        )}

        {/* Auto-payout */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Auto-payout
          </Text>
          <Card style={{padding: 6}}>
            {CADENCES.map((c, idx) => {
              const selected = localAuto.enabled && localAuto.cadence === c.key;
              return (
                <View key={c.key}>
                  <TouchableOpacity onPress={() => pickCadence(c.key)} activeOpacity={0.7} className="flex-row items-center px-3 py-3.5">
                    <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${selected ? 'border-keystone_navy bg-keystone_navy' : 'border-text_muted'}`}>
                      {selected && <View className="w-2 h-2 rounded-full bg-keystone_gold" />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-keystone_navy font-inter-semibold text-base">{c.label}</Text>
                      <Text className="text-text_muted font-inter text-xs">{c.sub}</Text>
                    </View>
                    {selected && <Text className="text-keystone_gold font-inter-semibold text-xs uppercase">On</Text>}
                  </TouchableOpacity>
                  {idx < CADENCES.length - 1 && <Divider style={{marginHorizontal: 12}} />}
                </View>
              );
            })}
          </Card>
          {localAuto.enabled ? (
            <TouchableOpacity onPress={disableAuto} className="mt-3 ml-1">
              <Text className="text-text_muted font-inter text-xs underline">Turn off auto-payout</Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-text_muted font-inter text-xs mt-3 ml-1">
              Off — you're sweeping manually. Pick a cadence to automate it.
            </Text>
          )}
        </View>

        {/* Recent payouts */}
        {balance?.recentPayouts?.length > 0 && (
          <View className="px-4 mt-5">
            <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
              Recent payouts
            </Text>
            <Card style={{padding: 6}}>
              {balance.recentPayouts.map((p, idx) => (
                <View key={p.id}>
                  {idx > 0 && <Divider style={{marginHorizontal: 12}} />}
                  <View className="flex-row items-center px-3 py-3">
                    <View style={{backgroundColor: 'rgba(5,166,96,0.10)'}} className="w-9 h-9 rounded-lg items-center justify-center mr-3">
                      <Icon name="bank" size={17} color={COLORS.c_success} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-keystone_navy font-inter-semibold text-sm">
                        {usdCents(p.amount)}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs mt-0.5">
                        {p.rail} · {p.daysAgo === 0 ? 'today' : `${p.daysAgo}d ago`}
                      </Text>
                    </View>
                    <StatusPill tone="success" label={p.status} />
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {(isPending || autoMut.isPending) && (
          <View className="items-center justify-center py-8">
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const FlowCell = ({label, value, sub, align = 'left', gold}) => (
  <View style={{flex: 1, alignItems: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start'}}>
    <Text className="text-white/55 font-inter-medium text-2xs uppercase tracking-wider">{label}</Text>
    <Text
      style={{color: gold ? COLORS.keystone_gold : '#FFFFFF'}}
      className="font-inter-bold text-sm mt-1">
      {value}
    </Text>
    <Text className="text-white/40 font-inter text-2xs mt-0.5">{sub}</Text>
  </View>
);

export default Payout;
