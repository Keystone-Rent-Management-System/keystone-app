import React, {useState} from 'react';
import {Image, StatusBar, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useOnboarding} from '../../hooks/useOnboarding';
import {Card, Divider} from '../../components/premium';
import {DemoBar, FormField, PrimaryButton, Screen} from '../../components/kit';
import {PhotoCaptureTile, pickPhoto} from '../../components/kit/photo';
import {
  clearDemoIdentity,
  demoSsnLast4,
  getDemoIdPhoto,
  setDemoIdPhoto,
  setDemoSsn,
} from '../../provider/store/demoIdentity';
import {useDemoOnboardingStore} from '../../provider/store/demoOnboarding';
import {can} from '../../constants/capabilities';
import {toast} from '../../utils/toast';

// Identity step of the SIMULATED onboarding journey.
//
// READ THIS BEFORE COPYING ANY OF IT INTO THE REAL FLOW.
//
// `AboutYou.jsx` says the real onboarding form collects NO identifiers —
// no SSN, no date of birth. That is still true and still right. This
// screen deliberately does the opposite, because the question "how does
// it feel to be asked for your social security number and a photo of your
// licence by a rental app?" cannot be answered by a screen that doesn't
// ask. It is reachable only under __DEV__ + Fixtures.
//
// What that costs us, and how it is contained:
//
//   · Nothing is stored. The SSN and the image URI live in module memory
//     (provider/store/demoIdentity) and die with the process. No MMKV, no
//     Keychain, no upload, no telemetry.
//   · Only the last four are ever readable back, so no screen can render
//     or log the whole number.
//   · The image IS copied — into our own cache, under a demo-scoped
//     name — and deleted on clear. The picker's URI is never retained,
//     because that points into a store we do not own and must not delete.
//
// FOR THE REAL BUILD this is nowhere near sufficient. Collecting an SSN
// makes Keystone a handler of exactly the data that makes identity theft
// possible, and collecting it for a background check makes the FCRA
// permissible-purpose and adverse-action rules apply. That is counsel's
// call and a vendor's job — the number should very likely go straight to
// the screening provider and never touch our servers at all.

const DEMO_ONLY = 'Demo — nothing here is stored, uploaded, or checked';

const IdentityCheck = () => {
  const nav = useNavigation();
  const {status} = useOnboarding();
  const setDemoState = useDemoOnboardingStore(s => s.setState);

  const [ssn, setSsn] = useState('');
  const [photo, setPhoto] = useState(getDemoIdPhoto());
  const [capturing, setCapturing] = useState(false);

  // The real screen would never be reachable without the capability; the
  // demo one should not be either.
  if (!can('identityVerification')) {
    return (
      <Screen title="Identity check" back="Application">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <Card>
          <Text className="text-keystone_navy font-inter-semibold text-[15px]">
            Not available yet
          </Text>
          <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
            Identity verification isn’t part of Keystone yet. Your landlord
            will let you know if they need anything else.
          </Text>
        </Card>
      </Screen>
    );
  }

  const onCapture = async () => {
    setCapturing(true);
    try {
      const asset = await pickPhoto();
      if (asset?.uri) {
        // Store OUR copy's path, never the picker's URI.
        const stored = await setDemoIdPhoto(asset.uri);
        setPhoto(stored);
        if (!stored) {
          toast.show('We couldn’t save that photo. Try again.', toast.SHORT);
        }
      }
    } finally {
      setCapturing(false);
    }
  };

  const digits = ssn.replace(/\D/g, '');
  const ready = digits.length === 9 && !!photo;

  const onContinue = () => {
    // Memory only. See demoIdentity.
    setDemoSsn(digits);
    setDemoState('SCREENING_CONSENT_REQUIRED');
    toast.show(
      'Demo — your details were kept on this device only and will be gone when you close the app.',
      toast.LONG,
    );
    nav.goBack();
  };

  const onDiscard = async () => {
    setSsn('');
    setPhoto(null);
    // Only claim it is gone if it is gone. Saying "cleared" over a file
    // the unlink failed to remove would be a false success on the one
    // screen whose entire purpose is an honest privacy claim.
    const cleared = await clearDemoIdentity();
    toast.show(
      cleared
        ? 'Cleared from this device.'
        : 'We couldn’t delete the photo from this device. Close and reopen the app, or remove it from Settings.',
      cleared ? toast.SHORT : toast.LONG,
    );
  };

  return (
    <Screen
      title="Confirm it’s you"
      back="Application"
      stickyFooter={
        <PrimaryButton
          label="Continue"
          disabled={!ready}
          onPress={onContinue}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <View
        style={{
          backgroundColor: 'rgba(205,160,0,0.14)',
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 14,
          marginBottom: 16,
        }}>
        <Text
          style={{color: '#7A6100', fontFamily: 'Inter-SemiBold', fontSize: 13}}>
          {DEMO_ONLY}
        </Text>
      </View>

      <Text className="text-keystone_slate font-inter text-[15px] leading-6 mb-4">
        {status?.landlord ?? 'Your landlord'} needs to confirm you are who you
        say you are before they can run a background check for{' '}
        {status?.space ?? 'this room'}.
      </Text>

      <Card>
        <Text className="text-keystone_navy font-inter-semibold text-[15px]">
          Photo of your driver’s licence
        </Text>
        <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1 mb-3">
          Front only. Make sure the whole card is in frame and the text is
          readable.
        </Text>

        {photo ? (
          <View>
            <Image
              source={{uri: photo}}
              style={{
                width: '100%',
                height: 180,
                borderRadius: 12,
                backgroundColor: '#E7E5DA',
              }}
              resizeMode="cover"
            />
            <Text
              className="text-text_muted font-inter text-xs mt-2"
              onPress={onCapture}>
              Tap here to retake
            </Text>
          </View>
        ) : (
          <PhotoCaptureTile
            state={capturing ? 'uploading' : 'default'}
            onPress={onCapture}
            label="Add licence"
          />
        )}
      </Card>

      <View style={{height: 16}} />

      <Card>
        <Text className="text-keystone_navy font-inter-semibold text-[15px]">
          Social security number
        </Text>
        <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1 mb-3">
          The screening agency uses this to be sure the report is about you and
          not someone with a similar name.
        </Text>
        <FormField
          label="SSN"
          value={ssn}
          onChangeText={setSsn}
          placeholder="000-00-0000"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={11}
        />
        {demoSsnLast4() ? (
          <Text className="text-text_muted font-inter text-xs mt-1">
            Ends in {demoSsnLast4()} · held on this device only
          </Text>
        ) : null}
      </Card>

      <Card style={{marginTop: 16}}>
        <Text className="text-keystone_navy font-inter-semibold text-[15px]">
          What happens to this
        </Text>
        <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
          In this demo: nothing. Your number and photo stay on this phone, are
          never uploaded, and disappear when you close the app.
        </Text>
        <Divider style={{marginVertical: 12}} />
        <Text
          className="text-keystone_navy font-inter-semibold text-[13px]"
          onPress={onDiscard}>
          Delete what I’ve entered
        </Text>
      </Card>

      <Text className="text-text_muted font-inter text-xs leading-5 mt-4">
        In a real Keystone this screen would send your details straight to the
        screening agency without Keystone keeping a copy — and the wording
        would be written with our lawyers first.
      </Text>
    
      {/* Present on every journey screen, not just the
          checklist — the states in between are where the sequence
          actually gets judged. */}
      <DemoBar />
      <View style={{height: 96}} />
    </Screen>
  );
};

export default IdentityCheck;
