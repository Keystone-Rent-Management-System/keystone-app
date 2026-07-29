import React, {useState} from 'react';
import {StatusBar, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {Card} from '../../components/premium';
import {
  PhotoCaptureTile,
  PhotoThumbRow,
  PrimaryButton,
  Screen,
  SectionLabel,
  SegmentedChoice,
  pickPhoto,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Checklist — log a room (design 4f). Exactly the data model in the
// code: condition (Good/Fair/Poor) + photos + optional note — nothing
// invented. Photo tiles are the 4a primitive at the 88px capture
// size; the guidance line tells the user what makes good evidence;
// the CTA counts progress so saving feels like advancing the
// walkthrough.

const CONDITIONS = ['Good', 'Fair', 'Poor'];

const ChecklistRoom = () => {
  const nav = useNavigation();
  const {params = {}} = useRoute();
  const room = params.room ?? {};
  const progress = params.progress ?? {done: 0, total: 6};

  const [condition, setCondition] = useState(room.condition ?? null);
  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState(room.note ?? '');

  const addPhoto = async () => {
    const asset = await pickPhoto();
    if (asset?.uri) setPhotos(p => [...p, asset]);
  };

  const nextCount = room.done ? progress.done : progress.done + 1;
  const canSave = !!condition;

  const save = () => {
    // PATCH /tenants/checklist/:roomId lands with the BE; until then
    // the parent list merges this via route params.
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
    </Screen>
  );
};

export default ChecklistRoom;
