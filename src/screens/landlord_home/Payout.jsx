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
import {usdCents} from '../../utils/money';
import {Card, IconChip, Label, Amount, Divider} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Instant Payout — "Buildium makes him wait; we let him move money
// when he wants it." Navy feature card with the available balance,
// a single Send-to-Bank action, autopay cadences below.

const CADENCES = [
  {key: 'DAILY_6AM', label: 'Daily', sub: 'Every day at 6 AM'},
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
      `${usdCents(balance.available)} will be wired via FedNow to ${
        balance?.bank?.name ?? 'your bank'
      } ····${balance?.bank?.accountLast4 ?? ''}.`,
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
        {/* Feature balance + send */}
        <View className="px-4 pt-4">
          <Card feature>
            <Label onDark>Available to payout</Label>
            <Amount size="xl" accent="gold" onDark style={{marginTop: 10, color: COLORS.keystone_gold}}>
              {usdCents(balance?.available ?? 0)}
            </Amount>
            <Text className="text-white/55 font-inter text-xs mt-1">
              Settles to {balance?.bank?.name ?? 'your bank'} ····
              {balance?.bank?.accountLast4 ?? '—'}
            </Text>

            <TouchableOpacity
              onPress={handleSend}
              disabled={sendMut.isPending || !balance?.available}
              activeOpacity={0.85}
              className="bg-keystone_gold rounded-2xl p-4 items-center mt-5">
              {sendMut.isPending ? (
                <ActivityIndicator color={COLORS.keystone_navy} />
              ) : (
                <Text className="text-keystone_navy font-inter-bold text-base uppercase tracking-wider">
                  Send to bank now
                </Text>
              )}
            </TouchableOpacity>
            <Text className="text-white/45 font-inter text-2xs text-center mt-3">
              Arrives in under 60 seconds via FedNow
            </Text>
          </Card>
        </View>

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
                  <TouchableOpacity
                    onPress={() => pickCadence(c.key)}
                    activeOpacity={0.7}
                    className="flex-row items-center px-3 py-3.5">
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                        selected ? 'border-keystone_navy bg-keystone_navy' : 'border-text_muted'
                      }`}>
                      {selected && <View className="w-2 h-2 rounded-full bg-keystone_gold" />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-keystone_navy font-inter-semibold text-base">
                        {c.label}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs">{c.sub}</Text>
                    </View>
                  </TouchableOpacity>
                  {idx < CADENCES.length - 1 && <Divider style={{marginHorizontal: 12}} />}
                </View>
              );
            })}
          </Card>
          {localAuto.enabled && (
            <TouchableOpacity onPress={disableAuto} className="mt-3 ml-1">
              <Text className="text-text_muted font-inter text-xs underline">
                Disable auto-payout
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {(isPending || autoMut.isPending) && (
          <View className="items-center justify-center py-8">
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Payout;
