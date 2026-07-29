import React, {useEffect, useMemo, useState} from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {useTenantChecklist} from '../../hooks/useTenantHome';
import {Card, ProgressBar} from '../../components/premium';
import {
  HeroCard,
  ListRow,
  Screen,
  SectionLabel,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Condition checklist (design 4e / move-out 4g). The hero footnote no
// longer clips (H2/H4); the photo total surfaces as the hero chip.
// Rows follow P5: condition + photo count + note preview inline;
// unlogged rooms show a muted state + explicit "Log ›" affordance.
// The move-out variant compares each room against the move-in
// baseline — that's what makes deductions fair.

const Checklist = () => {
  const nav = useNavigation();
  const route = useRoute();
  const {checklist, isPending, isRefetching, refetch} = useTenantChecklist();

  // Rooms logged this session (BE PATCH lands later) — merged over the
  // query result so "Save room" on the log screen updates this list.
  const [overrides, setOverrides] = useState({});
  useEffect(() => {
    const logged = route.params?.loggedRoom;
    if (logged?.id) {
      setOverrides(prev => ({...prev, [logged.id]: logged}));
      nav.setParams({loggedRoom: undefined});
    }
  }, [route.params?.loggedRoom, nav]);

  const isMoveOut = checklist?.type === 'MOVE_OUT';
  const rooms = useMemo(
    () =>
      (checklist?.rooms ?? []).map(r =>
        overrides[r.id] ? {...r, ...overrides[r.id], done: true} : r,
      ),
    [checklist?.rooms, overrides],
  );
  const done = rooms.filter(r => r.done).length;
  const pct = rooms.length ? Math.round((done / rooms.length) * 100) : 0;
  const photoTotal = rooms.reduce((sum, r) => sum + (r.photos ?? 0), 0);

  const goLog = room =>
    nav.navigate('checklist_room', {
      room,
      progress: {done, total: rooms.length},
      isMoveOut,
    });

  return (
    <Screen
      title={isMoveOut ? 'Move-out walkthrough' : 'Condition checklist'}
      back="My Home"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label={isMoveOut ? 'Move-out · vs move-in baseline' : 'Move-in walkthrough'}
        badge={photoTotal > 0 ? {text: `${photoTotal} photos`} : undefined}
        amount={`${done} of ${rooms.length} rooms`}
        amountSize={28}
        sub={
          isMoveOut
            ? 'Each room is compared to your move-in photos — that’s what makes deductions fair.'
            : 'Your photo record protects your deposit.'
        }>
        <View style={{marginTop: 12}}>
          <ProgressBar percent={pct} onDark />
        </View>
      </HeroCard>

      <View className="mt-5">
        <SectionLabel>Rooms</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {rooms.map((r, i) => {
            const sub = r.done
              ? isMoveOut && r.baseline
                ? `Move-in: ${r.baseline.condition} · ${r.baseline.photos} photos → now ${r.condition}${
                    r.note ? ` · ${r.note}` : ''
                  }`
                : `${r.condition}${
                    r.photos
                      ? ` · ${r.photos} photo${r.photos > 1 ? 's' : ''}`
                      : ''
                  }${r.note ? ` · ${r.note}` : ''}`
              : isMoveOut && r.baseline
                ? `Baseline: ${r.baseline.condition} · ${r.baseline.photos} photos`
                : 'Not logged yet';
            const chip = r.done
              ? isMoveOut
                ? r.baseline && r.condition !== r.baseline.condition
                  ? {label: 'Review', tone: 'pending'}
                  : {label: isMoveOut ? 'Matches' : 'Done', tone: 'success'}
                : {label: 'Done', tone: 'success'}
              : undefined;
            return (
              <ListRow
                key={r.id}
                icon="reports"
                iconColor={r.done ? COLORS.c_success : COLORS.keystone_gold}
                title={r.room}
                sub={sub}
                chip={chip}
                right={
                  !r.done ? (
                    <Text className="text-keystone_gold font-inter-semibold text-sm">
                      Log ›
                    </Text>
                  ) : undefined
                }
                last={i === rooms.length - 1}
                onPress={() => goLog(r)}
              />
            );
          })}
        </Card>
        {isPending && (
          <Text className="text-text_muted font-inter text-sm ml-1 mt-3">
            Loading…
          </Text>
        )}
        {isMoveOut && (
          <Text className="text-keystone_slate font-inter text-xs mt-3 leading-5">
            When you finish, both you and your landlord get the side-by-side
            record — your deposit clock starts from your notice date.
          </Text>
        )}
      </View>
    </Screen>
  );
};

export default Checklist;
