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
import {Card, IconChip, Label, Stat, Divider, StatusPill, Icon} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Maintenance visibility (NOT management). The overdue flag is the
// load-bearing element — he supervises the system, intervenes only
// when something turns red.

const Maintenance = () => {
  const {summary, isPending, isRefetching, refetch} = useMaintenance();
  const overdue = summary?.overdue ?? 0;

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
          <Text className="text-keystone_navy font-inter-bold text-2xl">Maintenance</Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Visibility only — your PM works the queue
          </Text>
        </View>

        {/* Counts grid */}
        <View className="px-4">
          <View className="flex-row flex-wrap -m-1">
            <CountTile label="Open" value={summary?.openRequests ?? 0} />
            <CountTile label="In Progress" value={summary?.inProgress ?? 0} />
            <CountTile label="Awaiting Parts" value={summary?.awaitingParts ?? 0} />
            <CountTile label="Overdue 7+ days" value={overdue} danger={overdue > 0} />
          </View>
        </View>

        {overdue > 0 ? (
          <>
            <View className="px-5 mt-6 mb-3 flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-c_danger" />
              <Text className="text-c_danger font-inter-semibold text-xs uppercase tracking-widest">
                Red flag · overdue
              </Text>
            </View>
            {(summary?.overdueDetails ?? []).map(item => (
              <View key={item.id} className="px-4 mb-3">
                <Card style={{borderLeftWidth: 3, borderLeftColor: COLORS.c_danger}}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        style={{backgroundColor: 'rgba(229,53,53,0.10)'}}
                        className="w-10 h-10 rounded-lg items-center justify-center">
                        <Icon name="wrench" size={19} color={COLORS.c_danger} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-keystone_navy font-inter-semibold text-base">
                          {item.unitName}
                        </Text>
                        <Text className="text-text_muted font-inter text-xs mt-0.5">
                          {item.issue}
                        </Text>
                      </View>
                    </View>
                    <StatusPill tone="danger" label={`${item.ageDays}d`} />
                  </View>
                  {item.assignedTo && (
                    <>
                      <Divider style={{marginVertical: 12}} />
                      <Text className="text-text_muted font-inter text-xs">
                        Assigned to {item.assignedTo}
                      </Text>
                    </>
                  )}
                </Card>
              </View>
            ))}
          </>
        ) : (
          !isPending && (
            <Text className="text-c_success font-inter text-sm text-center py-10 px-4">
              ✓ Nothing overdue — the system is working.
            </Text>
          )
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

const CountTile = ({label, value, danger}) => (
  <View className="w-1/2 p-1">
    <Card style={{padding: 16, borderRadius: 18}}>
      <Text
        className={`font-inter-bold text-3xl ${danger ? 'text-c_danger' : 'text-keystone_navy'}`}>
        {value}
      </Text>
      <Text
        className={`font-inter-semibold text-xs uppercase tracking-wide mt-1 ${
          danger ? 'text-c_danger' : 'text-text_muted'
        }`}>
        {label}
      </Text>
    </Card>
  </View>
);

export default Maintenance;
