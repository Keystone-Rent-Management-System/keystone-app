import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';

import {useTenantStatement} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, Label, Divider, Stat, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Statement — a clean rent ledger: charges (rent) and credits
// (payments) with a running balance. Replaces the dense Pallax
// statement/PDF view; same idea, calmer.

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
};

const Statements = () => {
  const {statement, isPending, isRefetching, refetch} = useTenantStatement();
  const entries = statement?.entries ?? [];
  const balance = statement?.closingBalance ?? 0;

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Balance */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>Current balance</Label>
            <Text
              className="font-inter-bold text-3xl mt-2"
              style={{color: balance > 0 ? '#FFFFFF' : '#9FE6C4', letterSpacing: -0.5}}>
              {usd(balance)}
            </Text>
            <Text className="text-white/55 font-inter text-xs mt-1">
              {balance > 0
                ? 'This is your current rent due.'
                : 'You’re all settled — nothing owed.'}
            </Text>
          </Card>
        </View>

        {/* Totals */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row">
              <Stat label="Charges" value={usd(statement?.totalCharges)} />
              <View className="w-px bg-keystone_hairline" />
              <Stat
                label="Payments"
                value={usd(statement?.totalCredits)}
                valueColor={COLORS.c_success}
                align="right"
              />
            </View>
          </Card>
        </View>

        {/* Ledger */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Activity
          </Text>
          {isPending ? (
            <Text className="text-text_muted font-inter text-sm ml-1">Loading…</Text>
          ) : (
            <Card style={{paddingVertical: 6}}>
              {entries.map((e, i) => {
                const isCredit = (e.credit ?? 0) > 0;
                return (
                  <View key={e.id}>
                    {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                    <View className="flex-row items-center px-3 py-3">
                      <IconChip size={36}>
                        <Icon
                          name={isCredit ? 'card' : 'collection'}
                          size={16}
                          color={isCredit ? COLORS.c_success : COLORS.keystone_gold}
                        />
                      </IconChip>
                      <View className="flex-1 ml-3">
                        <Text className="text-keystone_navy font-inter-semibold text-sm">
                          {e.description}
                        </Text>
                        <Text className="text-text_muted font-inter text-xs mt-0.5">
                          {fmtDate(e.entryDate)}
                        </Text>
                      </View>
                      <Text
                        className="font-inter-bold text-sm"
                        style={{color: isCredit ? COLORS.c_success : COLORS.keystone_navy}}>
                        {isCredit ? '−' : '+'}
                        {usd(isCredit ? e.credit : e.charge)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Statements;
