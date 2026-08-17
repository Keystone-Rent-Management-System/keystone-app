import React, {useState} from 'react';
import {ActivityIndicator, Linking, StatusBar, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import HelpServices from '../../services/help';
import {repairCategories} from '../../services/mocks';
import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Icon} from '../../components/premium';
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
import {toast} from '../../utils/toast';
import {getError} from '../../utils/getError';

// Report a repair (design 4i): category chips + urgency segments keep
// it three taps + one sentence; photos via the 4a primitive (matching
// the existing image-picker mechanics); helper copy explains why
// photos matter. The Emergency segment is where the call-now
// escalation attaches — life-safety issues shouldn't wait in a queue.
// POST /request-repair (HelpServices.requestRepair) unchanged.

const URGENCY = [
  {value: 'wait', label: 'Can wait'},
  {value: 'week', label: 'This week'},
  {value: 'emergency', label: 'Emergency'},
];

const ReportRepair = () => {
  const nav = useNavigation();
  const {home} = useTenantHome();
  const emergencyPhone =
    home?.lease?.emergencyPhone ?? home?.lease?.landlordPhone;

  const [category, setCategory] = useState(null);
  const [desc, setDesc] = useState('');
  const [photos, setPhotos] = useState([]);
  const [urgency, setUrgency] = useState('wait');
  const [busy, setBusy] = useState(false);

  const addPhoto = async () => {
    const asset = await pickPhoto();
    if (asset?.uri) setPhotos(p => [...p, asset]);
  };

  const call = number => {
    if (number) Linking.openURL(`tel:${number}`).catch(() => {});
  };

  const canSubmit = category && desc.trim().length > 2;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    const urgent = urgency === 'emergency';
    const fd = new FormData();
    // The `[URGENT]`/`[THIS WEEK]` prefix is LOAD-BEARING, not decoration.
    // BE confirmed (§T7, 2026-07-29) that `repair_requests` has no priority
    // column, so the `priority` field below is accepted and dropped — it
    // does not round-trip, and the landlord's maintenance queue cannot
    // triage on it. The prefix is the only way urgency reaches a human
    // today. Don't remove it until BE ships a real priority column.
    fd.append(
      'message',
      `${urgent ? '[URGENT] ' : urgency === 'week' ? '[THIS WEEK] ' : ''}${category}: ${desc.trim()}`,
    );
    fd.append('priority', urgent ? 'URGENT' : 'NORMAL');
    photos.forEach((photo, i) => {
      fd.append('attachmentFile', {
        uri: photo.uri,
        type: photo.type ?? 'image/jpeg',
        name: photo.fileName ?? `repair-${i + 1}.jpg`,
      });
    });
    // Never confirm a repair that did not reach the landlord. This
    // previously swallowed the error and said "your landlord is
    // notified" — for an emergency (no heat, a leak) that is the
    // difference between a tenant escalating and a tenant waiting.
    try {
      await HelpServices.requestRepair(fd);
    } catch (err) {
      setBusy(false);
      toast.show(
        `We couldn’t send this repair — ${getError(err)}. Nothing was sent.${
          urgent ? ' If this is an emergency, call instead.' : ''
        }`,
        toast.LONG,
      );
      return;
    }
    toast.show(
      urgent
        ? 'Sent as urgent — your landlord is notified'
        : 'Sent to your landlord — they’re notified',
      toast.LONG,
    );
    setBusy(false);
    nav.navigate('repairs');
  };

  return (
    <Screen
      title="Report a repair"
      back="Repairs"
      stickyFooter={
        busy ? (
          <View style={{minHeight: 52, justifyContent: 'center'}}>
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        ) : (
          <PrimaryButton
            label="Send to your landlord"
            disabled={!canSubmit}
            onPress={submit}
          />
        )
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {/* Category */}
      <SectionLabel>What kind of issue?</SectionLabel>
      <View className="flex-row flex-wrap gap-2">
        {repairCategories.map(c => {
          const on = c === category;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              activeOpacity={0.85}
              style={on ? {backgroundColor: COLORS.keystone_navy} : null}
              className={`px-4 py-2.5 rounded-xl ${
                on ? '' : 'bg-white border border-keystone_hairline'
              }`}>
              <Text
                className={`font-inter-medium text-sm ${
                  on ? 'text-white' : 'text-keystone_navy'
                }`}>
                {c}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Description */}
      <SectionLabel style={{marginTop: 20}}>What's happening?</SectionLabel>
      <Card style={{padding: 4}}>
        <TextInput
          value={desc}
          onChangeText={setDesc}
          placeholder="e.g. Kitchen faucet drips constantly, worse when hot water is on."
          placeholderTextColor="rgba(21,37,53,0.35)"
          multiline
          className="text-keystone_navy font-inter text-[15px] px-3 py-3"
          style={{minHeight: 96, textAlignVertical: 'top'}}
        />
      </Card>

      {/* Urgency */}
      <SectionLabel style={{marginTop: 20}}>How urgent?</SectionLabel>
      <SegmentedChoice options={URGENCY} value={urgency} onChange={setUrgency} />

      {/* Emergency escalation — attaches to the Emergency segment */}
      {urgency === 'emergency' && (
        <Card
          style={{
            marginTop: 12,
            borderColor: COLORS.c_danger,
            borderWidth: 1,
            backgroundColor: 'rgba(229,53,53,0.06)',
          }}>
          <View className="flex-row items-start gap-3">
            <View
              style={{backgroundColor: 'rgba(229,53,53,0.12)'}}
              className="w-9 h-9 rounded-lg items-center justify-center">
              <Icon name="bell" size={18} color={COLORS.c_danger} />
            </View>
            <View className="flex-1">
              <Text className="text-keystone_navy font-inter-semibold text-sm">
                Don't wait on a ticket
              </Text>
              <Text className="text-text_muted font-inter text-xs leading-5 mt-0.5">
                Gas, fire, or flooding — call 911 now. No heat, water, or a
                lockout — call your landlord's after-hours line.
              </Text>
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={() => call('911')}
                  activeOpacity={0.9}
                  style={{backgroundColor: COLORS.c_danger}}
                  className="px-4 py-2 rounded-xl">
                  <Text className="text-white font-inter-semibold text-xs">
                    Call 911
                  </Text>
                </TouchableOpacity>
                {emergencyPhone ? (
                  <TouchableOpacity
                    onPress={() => call(emergencyPhone)}
                    activeOpacity={0.85}
                    className="px-4 py-2 rounded-xl border border-keystone_navy">
                    <Text className="text-keystone_navy font-inter-semibold text-xs">
                      Call landlord
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </Card>
      )}

      {/* Photos — 4a primitive */}
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
      <Text className="text-keystone_slate font-inter text-xs mt-2">
        A photo helps the vendor arrive with the right parts.
        {photos.length > 0 ? ' Tap a photo to remove it.' : ''}
      </Text>
    </Screen>
  );
};

export default ReportRepair;
