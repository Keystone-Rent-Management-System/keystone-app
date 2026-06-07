import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import {useTenantChecklist} from '../../hooks/useTenantHome';
import {Card, Label, Divider, ProgressBar, Icon, IconChip, StatusPill} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Move-in / move-out condition checklist. Each room gets a condition +
// photos; this is the deposit baseline the landlord compares against at
// move-out — so it directly protects the tenant's refund.

const Checklist = () => {
  const {checklist, isPending, isRefetching, refetch} = useTenantChecklist();
  const rooms = checklist?.rooms ?? [];
  const done = rooms.filter(r => r.done).length;
  const pct = rooms.length ? Math.round((done / rooms.length) * 100) : 0;

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Progress hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>
              {checklist?.type === 'MOVE_OUT' ? 'Move-out walkthrough' : 'Move-in walkthrough'}
            </Label>
            <Text className="text-white font-inter-bold text-2xl mt-2">
              {done} of {rooms.length} rooms
            </Text>
            <Text className="text-white/55 font-inter text-xs mt-1 mb-3">
              Your photo record protects your deposit.
            </Text>
            <ProgressBar percent={pct} onDark />
          </Card>
        </View>

        {/* Rooms */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Rooms
          </Text>
          <Card style={{paddingVertical: 6}}>
            {rooms.map((r, i) => (
              <View key={r.id}>
                {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    ToastAndroid.show(
                      r.done ? `${r.room} · ${r.condition}` : `Log ${r.room} — coming soon`,
                      ToastAndroid.SHORT,
                    )
                  }
                  className="flex-row items-center px-3 py-3.5">
                  <View
                    className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                    style={{backgroundColor: r.done ? 'rgba(5,166,96,0.12)' : COLORS.keystone_chip}}>
                    <Icon name="reports" size={16} color={r.done ? COLORS.c_success : COLORS.keystone_gold} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">
                      {r.room}
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      {r.done
                        ? `${r.condition}${r.photos ? ` · ${r.photos} photo${r.photos > 1 ? 's' : ''}` : ''}${r.note ? ` · ${r.note}` : ''}`
                        : 'Not logged yet'}
                    </Text>
                  </View>
                  {r.done ? (
                    <StatusPill label="Done" tone="success" />
                  ) : (
                    <Text className="text-keystone_gold font-inter-semibold text-xs">Log ›</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </Card>
          {isPending && (
            <Text className="text-text_muted font-inter text-sm ml-1 mt-3">Loading…</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Checklist;
