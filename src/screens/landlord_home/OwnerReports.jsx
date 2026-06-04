import React, {useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useGenerateOwnerReport, useEmailOwnerReport} from '../../hooks/useOwners';
import {usePortfolio} from '../../hooks/usePortfolio';
import {usd} from '../../utils/money';
import {Card, IconChip, Label, Amount, Divider, Icon} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Statements — for a landlord who OWNS his units. Not "reporting to
// owners"; this is the clean financial summary he hands his
// accountant or keeps for taxes. Pick a period, get a tidy PDF —
// no spreadsheets, no bookkeeping.

const PERIODS = [
  {key: 'MONTH', label: 'This month'},
  {key: 'QUARTER', label: 'This quarter'},
  {key: 'YTD', label: 'Year to date'},
];

const INCLUDES = [
  'Rent collected vs expected',
  'Operating expenses & repairs',
  'Vacancy & late fees',
  'Net operating income',
  'Year-end summary your accountant can use',
];

const OwnerReports = () => {
  const [period, setPeriod] = useState('MONTH');
  const {performance, isPending, isRefetching, refetch} = usePortfolio();
  const generate = useGenerateOwnerReport();
  const sendEmail = useEmailOwnerReport();

  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? '';

  const onGeneratePdf = async () => {
    ToastAndroid.show('Preparing your statement…', ToastAndroid.SHORT);
    const res = await generate
      .mutateAsync({ownerId: 'portfolio', period})
      .catch(() => null);
    ToastAndroid.show(
      res?.url ? 'Statement ready — opening' : res?.message ?? 'Coming soon',
      ToastAndroid.LONG,
    );
  };
  const onSendEmail = async () => {
    const res = await sendEmail
      .mutateAsync({ownerId: 'portfolio', period})
      .catch(() => null);
    ToastAndroid.show(res?.message ?? 'Sent to your accountant', ToastAndroid.LONG);
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
          <Text className="text-keystone_navy font-inter-bold text-2xl">Statements</Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Clean financials for your accountant or your records — no
            spreadsheets, no bookkeeping.
          </Text>
        </View>

        {/* Net snapshot (navy) */}
        <View className="px-4">
          <Card feature>
            <Label onDark>Net operating income · {periodLabel}</Label>
            <Amount size="xl" onDark style={{marginTop: 10}}>
              {usd(performance?.netCollected ?? 0)}
            </Amount>
            <Text className="text-white/55 font-inter text-xs mt-1">
              across your whole portfolio
            </Text>
          </Card>
        </View>

        {/* Period */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Period
          </Text>
          <View className="flex-row gap-2">
            {PERIODS.map(p => {
              const on = period === p.key;
              return (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => setPeriod(p.key)}
                  activeOpacity={0.8}
                  style={on ? {backgroundColor: COLORS.keystone_navy} : null}
                  className={`flex-1 rounded-xl p-3 items-center ${on ? '' : 'bg-white border border-keystone_hairline'}`}>
                  <Text className={`font-inter-semibold text-sm ${on ? 'text-white' : 'text-keystone_navy'}`}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* What's inside */}
        <View className="px-4 mt-5">
          <Card>
            <View className="flex-row items-center gap-3 mb-1">
              <IconChip><Icon name="reports" size={19} /></IconChip>
              <Label>What's inside</Label>
            </View>
            <Divider style={{marginVertical: 10}} />
            {INCLUDES.map(l => (
              <View key={l} className="flex-row items-center py-1.5">
                <Text className="text-c_success font-inter-semibold mr-2">✓</Text>
                <Text className="text-keystone_navy font-inter text-sm">{l}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Actions */}
        <View className="px-4 mt-5 flex-row gap-3">
          <TouchableOpacity
            onPress={onGeneratePdf}
            disabled={generate.isPending}
            activeOpacity={0.85}
            className="flex-1 bg-keystone_navy rounded-2xl p-4 items-center">
            {generate.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-inter-semibold text-sm uppercase tracking-wider">
                Download PDF
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSendEmail}
            disabled={sendEmail.isPending}
            activeOpacity={0.85}
            className="flex-1 border border-keystone_navy rounded-2xl p-4 items-center">
            {sendEmail.isPending ? (
              <ActivityIndicator color={COLORS.keystone_navy} />
            ) : (
              <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wider">
                Email accountant
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {isPending && (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OwnerReports;
