import React, {useState} from 'react';
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
  useAutoPayout,
  usePayoutBalance,
  useSendToBank,
} from '../../hooks/usePayout';
import {usdCents} from '../../utils/money';

// Instant Payout — "Buildium makes him wait. We let him move money
// when he wants it." Big number, single Send to Bank Now button,
// autopay row below. No clutter.

const CADENCES = [
  {key: 'DAILY_6AM', label: 'Daily at 6 AM'},
  {key: 'WEEKLY_MON', label: 'Weekly — Mondays'},
  {key: 'MONTHLY_1ST', label: 'Monthly — 1st'},
];

const Payout = () => {
  const {balance, isPending, isRefetching, refetch} = usePayoutBalance();
  const sendMut = useSendToBank();
  const autoMut = useAutoPayout();

  const [localAuto, setLocalAuto] = useState({
    enabled: balance?.autoPayout?.enabled ?? false,
    cadence: balance?.autoPayout?.cadence ?? null,
  });

  // Sync server state down when balance refetches.
  React.useEffect(() => {
    if (balance?.autoPayout) {
      setLocalAuto({
        enabled: !!balance.autoPayout.enabled,
        cadence: balance.autoPayout.cadence,
      });
    }
  }, [balance?.autoPayout?.enabled, balance?.autoPayout?.cadence]);

  const handleSend = () => {
    if (!balance?.available) return;
    Alert.alert(
      'Send to bank now?',
      `${usdCents(balance.available)} will be wired via FedNow to ${balance?.bank?.name ?? 'your bank'} ****${balance?.bank?.accountLast4 ?? ''}.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Send',
          style: 'default',
          onPress: () => sendMut.mutate(balance.available),
        },
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
    <ScrollView
      className="flex-1 bg-keystone_stone"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }>
      {/* AVAILABLE BALANCE */}
      <View className="px-5 pt-8">
        <Text className="text-grey_1 font-inter text-xs uppercase tracking-widest">
          Available to payout
        </Text>
        <Text className="text-keystone_navy font-inter-bold text-4xl mt-2">
          {usdCents(balance?.available ?? 0)}
        </Text>
      </View>

      {/* SEND BUTTON */}
      <View className="px-5 mt-6">
        <TouchableOpacity
          onPress={handleSend}
          disabled={sendMut.isPending || !balance?.available}
          activeOpacity={0.85}
          className={`rounded-2xl p-5 items-center justify-center ${
            !balance?.available || sendMut.isPending
              ? 'bg-keystone_navy/40'
              : 'bg-keystone_navy'
          }`}>
          {sendMut.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-inter-semibold text-base uppercase tracking-wider">
              Send to bank now
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-grey_1 font-inter text-xs text-center mt-3">
          Arrives in {balance?.bank?.name ?? 'your bank'} ****
          {balance?.bank?.accountLast4 ?? '—'} in under 60 seconds via FedNow
        </Text>
      </View>

      {/* AUTO PAYOUT */}
      <View className="mx-4 mt-8 bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wide">
          Or set auto-payout
        </Text>
        <View className="h-px bg-keystone_cream my-3" />
        {CADENCES.map(c => {
          const selected = localAuto.enabled && localAuto.cadence === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              onPress={() => pickCadence(c.key)}
              activeOpacity={0.7}
              className="flex-row items-center py-3">
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                  selected
                    ? 'border-keystone_navy bg-keystone_navy'
                    : 'border-grey_1'
                }`}>
                {selected && (
                  <View className="w-2 h-2 rounded-full bg-white" />
                )}
              </View>
              <Text className="text-keystone_navy font-inter text-base">
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {localAuto.enabled && (
          <TouchableOpacity onPress={disableAuto} className="mt-2">
            <Text className="text-grey_1 font-inter text-xs underline">
              Disable auto-payout
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="h-12" />
      {(isPending || autoMut.isPending) && (
        <View className="absolute inset-0 items-center justify-center bg-white/60">
          <ActivityIndicator color="#152535" />
        </View>
      )}
    </ScrollView>
  );
};

export default Payout;
