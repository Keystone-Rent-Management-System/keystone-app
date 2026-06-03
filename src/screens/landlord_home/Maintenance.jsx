import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useMaintenance} from '../../hooks/useMaintenance';

// Maintenance visibility (NOT management). The overdue flag is the
// load-bearing element — the landlord supervises the system that
// does maintenance; he only intervenes when something turns red.

const Maintenance = () => {
  const {summary, isPending, isRefetching, refetch} = useMaintenance();

  return (
    <ScrollView
      className="flex-1 bg-keystone_stone"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }>
      <View className="px-5 pt-6 pb-4">
        <Text className="text-keystone_navy font-inter-semibold text-xl">
          Maintenance
        </Text>
        <Text className="text-grey_1 font-inter text-sm mt-1">
          Visibility only — your PM works the queue
        </Text>
      </View>

      {/* Bucket counts */}
      <View className="mx-4 bg-white rounded-2xl p-5 shadow-sm">
        <CountRow label="Open Requests" count={summary?.openRequests ?? 0} />
        <View className="h-px bg-keystone_cream my-2" />
        <CountRow label="In Progress" count={summary?.inProgress ?? 0} />
        <View className="h-px bg-keystone_cream my-2" />
        <CountRow label="Awaiting Parts" count={summary?.awaitingParts ?? 0} />
        <View className="h-px bg-keystone_cream my-2" />
        <CountRow
          label="Overdue (7+ days)"
          count={summary?.overdue ?? 0}
          flag={(summary?.overdue ?? 0) > 0}
        />
      </View>

      {/* Overdue details — the only thing he needs to see */}
      {(summary?.overdue ?? 0) > 0 && (
        <>
          <View className="px-5 mt-6 mb-2 flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <Text className="text-[#EF4444] font-inter-semibold text-sm uppercase tracking-wide">
              Red Flag — Overdue
            </Text>
          </View>
          {(summary?.overdueDetails ?? []).map(item => (
            <View
              key={item.id}
              className="mx-4 mb-3 bg-white rounded-2xl p-4 border-l-4 border-[#EF4444] shadow-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-keystone_navy font-inter-semibold text-base">
                  {item.unitName}
                </Text>
                <Text className="text-[#EF4444] font-inter-semibold text-xs">
                  {item.ageDays} days old
                </Text>
              </View>
              <Text className="text-grey_1 font-inter text-sm mt-1">
                {item.issue}
              </Text>
              {item.assignedTo && (
                <Text className="text-grey_1 font-inter text-xs mt-2">
                  Assigned to: {item.assignedTo}
                </Text>
              )}
            </View>
          ))}
        </>
      )}

      {(summary?.overdue ?? 0) === 0 && !isPending && (
        <Text className="text-[#22C55E] font-inter text-sm text-center py-10 px-4">
          ✓ Nothing overdue — the system is working.
        </Text>
      )}

      {isPending && (
        <View className="items-center justify-center py-10">
          <ActivityIndicator color="#152535" />
        </View>
      )}
    </ScrollView>
  );
};

const CountRow = ({label, count, flag}) => (
  <View className="flex-row items-center justify-between py-2">
    <Text
      className={`font-inter text-sm ${
        flag ? 'text-[#EF4444]' : 'text-grey_1'
      }`}>
      {label}
    </Text>
    <Text
      className={`font-inter-bold text-base ${
        flag ? 'text-[#EF4444]' : 'text-keystone_navy'
      }`}>
      {count}
    </Text>
  </View>
);

export default Maintenance;
