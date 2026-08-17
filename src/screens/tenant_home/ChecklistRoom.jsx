import React, {useState} from 'react';
import {StatusBar, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {Card} from '../../components/premium';
import {
  HeroCard,
  PhotoCaptureTile,
  PhotoThumbRow,
  PrimaryButton,
  Screen,
  SectionLabel,
  SegmentedChoice,
  pickPhoto,
} from '../../components/kit';
import {can} from '../../constants/capabilities';

// Condition checklist — room log (design 4f).
//
// TWO PRESENTATIONS, decided by `can('conditionRecords')`:
//
// · Capability ON (today that means DEMO mode only): the full logging
//   form — condition (Good/Fair/Poor) + photos + optional note. The
//   parent list merges the result via route params; nothing claims to be
//   stored anywhere else. The demo capability table promises
//   `conditionRecords`, and a promised step that renders only an apology
//   is a broken journey — the move-in inspection must be walkable.
//
// · Capability OFF (every real build until BE §T8 ships): the COLLECTION
//   is removed, not just the save. Disabling "Save room" would leave the
//   funnel intact: a tenant could still pick a condition, write a note
//   and take photos, and none of it would go anywhere — capturing
//   evidence into nothing is worse at move-out than never having offered
//   to. Until a real multipart write with a server-confirmed response
//   exists, the honest thing is to tell the tenant to keep their own
//   photos.

const CONDITIONS = ['Good', 'Fair', 'Poor'];

const ChecklistRoom = () => {
  const nav = useNavigation();
  const {params = {}} = useRoute();
  const room = params.room ?? {};
  const progress = params.progress ?? {done: 0, total: 6};

  const [condition, setCondition] = useState(room.condition ?? null);
  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState(room.note ?? '');

  if (!can('conditionRecords')) {
    return (
      <Screen title={room.room ?? 'Log room'} back="Checklist">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

        <HeroCard
          label="Condition record"
          amount="Not available yet"
          amountSize={22}
          sub="Keystone can’t store room conditions or photos yet."
        />

        <Card style={{marginTop: 20}}>
          <Text className="text-keystone_slate font-inter text-[15px] leading-6">
            Photograph {room.room ? `the ${room.room.toLowerCase()}` : 'each room'}{' '}
            with your own camera and keep the photos somewhere safe. They’re your
            evidence at move-out, so it matters that you hold them.
          </Text>
        </Card>
      </Screen>
    );
  }

  const addPhoto = async () => {
    const asset = await pickPhoto();
    if (asset?.uri) setPhotos(p => [...p, asset]);
  };

  const nextCount = room.done ? progress.done : progress.done + 1;
  const canSave = !!condition;

  const save = () => {
    // PATCH /tenants/checklist/:roomId lands with BE §T8; until then the
    // parent list merges this via route params.
    nav.navigate('checklist', {
      loggedRoom: {
        id: room.id,
        room: room.room,
        condition,
        photos: photos.length || room.photos || 0,
        note: note.trim() || null,
        done: true,
      },
    });
  };

  return (
    <Screen
      title={room.room ?? 'Log room'}
      back="Checklist"
      stickyFooter={
        <PrimaryButton
          label={`Save room — ${nextCount} of ${progress.total} done`}
          disabled={!canSave}
          onPress={save}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <SectionLabel>Condition</SectionLabel>
      <SegmentedChoice
        options={CONDITIONS}
        value={condition}
        onChange={setCondition}
      />

      <SectionLabel style={{marginTop: 20}}>
        {photos.length > 0 ? `Photos · ${photos.length}` : 'Photos'}
      </SectionLabel>
      {photos.length > 0 ? (
        <PhotoThumbRow
          photos={photos}
          onAdd={addPhoto}
          onView={i => setPhotos(p => p.filter((_, idx) => idx !== i))}
        />
      ) : (
        <PhotoCaptureTile onPress={addPhoto} />
      )}
      <Text className="text-keystone_slate font-inter text-xs mt-2 leading-5">
        Wide shots of the whole room, plus anything worn or damaged. More
        photos = stronger record.
        {photos.length > 0 ? ' Tap a photo to remove it.' : ''}
      </Text>

      <SectionLabel style={{marginTop: 20}}>Note · optional</SectionLabel>
      <Card style={{padding: 4}}>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Scratch near the balcony door"
          placeholderTextColor="rgba(21,37,53,0.35)"
          multiline
          className="text-keystone_navy font-inter text-[15px] px-3 py-3"
          style={{minHeight: 72, textAlignVertical: 'top'}}
        />
      </Card>
      <View style={{height: 24}} />
    </Screen>
  );
};

export default ChecklistRoom;
