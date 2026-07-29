import React from 'react';
import {StatusBar, View} from 'react-native';
import {useRoute} from '@react-navigation/native';

import {Card} from '../../components/premium';
import {
  HeroCard,
  PhotoThumbRow,
  Screen,
  SectionLabel,
  Timeline,
  eventDate,
} from '../../components/kit';

// Repair detail — with evidence (design 4j). The status chip no
// longer clips (H3/C1); a reference code (KS-R-…) rides the label —
// the same trust mechanic as payment receipts; the photo grid (P3)
// travels with the request; timeline follows 1g exactly.

const CHIP_TEXT = {
  SUBMITTED: 'Submitted',
  IN_PROGRESS: 'In progress',
  SCHEDULED: 'Scheduled',
  RESOLVED: 'Resolved',
};

const refCode = id =>
  `KS-R-${String(id ?? '000').replace(/\D/g, '').padStart(3, '1').slice(-3)}`;

const RepairDetail = () => {
  const {params = {}} = useRoute();
  const r = params.repair ?? {};
  const rawTimeline = r.timeline ?? [];

  // Map the BE shape ({label, date, done}) onto the 1g states: last
  // done step = current, later steps upcoming.
  const lastDone = rawTimeline.reduce((acc, t, i) => (t.done ? i : acc), -1);
  const steps = rawTimeline.map((t, i) => ({
    title: i === lastDone && r.status !== 'RESOLVED' ? `${t.label} — current` : t.label,
    sub: t.done
      ? [eventDate('', t.date).trim(), t.assignedTo].filter(Boolean).join(' · ')
      : `Expected ${eventDate('', t.date).trim()}`,
    state: t.done ? (i === lastDone && r.status !== 'RESOLVED' ? 'current' : 'done') : 'upcoming',
  }));

  // Thumbnails travel with the request (P3); until the BE serves photo
  // URLs the row renders flat placeholder tiles from the count (P5).
  const photos = Array.from({length: r.photos ?? 0}, (_, i) => ({
    uri: r.photoUrls?.[i],
  }));

  // 4j: the hero sub looks forward (next visit), not backward.
  const nextStep = rawTimeline.find(t => !t.done);
  const heroSub =
    r.status === 'RESOLVED'
      ? `${r.assignedTo ?? 'Vendor'} · ${eventDate('resolved', r.updatedOn)}`
      : !r.assignedTo
        ? 'Waiting for a vendor to be assigned'
        : nextStep
          ? `${r.assignedTo} · ${
              /visit/i.test(nextStep.label) ? 'visit scheduled' : nextStep.label.toLowerCase()
            } ${eventDate('', nextStep.date).trim()}`
          : `${r.assignedTo} · last update ${eventDate('', r.updatedOn).trim()}`;

  return (
    <Screen title="Repair" back="Repairs">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label={`${(r.category ?? '').toUpperCase()} · ${refCode(r.id)}`}
        badge={{
          text: CHIP_TEXT[r.status] ?? r.status ?? '',
          dot: r.status === 'RESOLVED' ? 'success' : 'pending',
        }}
        amount={r.title}
        amountSize={24}
        sub={heroSub}
      />

      {photos.length > 0 && (
        <View className="mt-5">
          <SectionLabel>Your photos · {photos.length}</SectionLabel>
          <PhotoThumbRow photos={photos} />
        </View>
      )}

      <View className="mt-5">
        <SectionLabel>Progress</SectionLabel>
        <Card>
          <Timeline steps={steps} />
        </Card>
      </View>
    </Screen>
  );
};

export default RepairDetail;
