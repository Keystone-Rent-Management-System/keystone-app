import React from 'react';
import {
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useOnboarding} from '../../hooks/useOnboarding';
import {Card, Divider, Icon} from '../../components/premium';
import {
  DemoBar,
  HeroCard,
  PrimaryButton,
  Screen,
  SectionLabel,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import useGlobals from '../../provider/store/useGlobals';
import * as RootNavigation from '../../RootNavigation';
import {useDevRoleStore} from '../../provider/store/devRole';
import useAuthSession, {
  AUTHENTICATED,
  endSession,
} from '../../provider/store/authSession';
import {clearDemoIdentity} from '../../provider/store/demoIdentity';
import AuthServices from '../../services/AuthServices';
import {toast} from '../../utils/toast';

// The applicant's home until they are actually a tenant.
//
// Sequence: invitation → about you → screening → LANDLORD DECISION →
// agreement → onboarded. The landlord decision is a step of its own on
// purpose: a completed background check is an input to that decision, not
// the decision itself, so "Background check — Complete" never unlocks the
// agreement. Only an explicit approval does, and the server expresses
// that by sending an agreement at all.
//
// There is no Refresh button. Waiting states say the tenant can close the
// app, because a refresh control invites someone to sit and poll a
// decision another human has to make.

const STATE_STYLE = {
  done: {mark: '✓', color: '#037147', bg: 'rgba(5,166,96,0.12)'},
  active: {mark: '', color: COLORS.keystone_navy, bg: 'rgba(21,37,53,0.06)'},
  waiting: {mark: '', color: '#7A6100', bg: 'rgba(205,160,0,0.14)'},
  attention: {mark: '!', color: '#B32020', bg: 'rgba(179,32,32,0.10)'},
  locked: {mark: '', color: COLORS.keystone_slate, bg: 'rgba(21,37,53,0.04)'},
};

const StepRow = ({step, last, onPress}) => {
  const s = STATE_STYLE[step.state] ?? STATE_STYLE.locked;
  const dim = step.state === 'locked';
  // A row that leads somewhere is a button; the rest are a record.
  // Waiting/locked/done rows deliberately don't respond — tapping
  // "Landlord review · Waiting" must not imply the tenant can act on it.
  const Row = onPress ? TouchableOpacity : View;
  return (
    <Row {...(onPress ? {activeOpacity: 0.7, onPress} : {})}>
      <View
        className="flex-row items-center"
        style={{paddingVertical: 14, opacity: dim ? 0.55 : 1}}>
        <View
          className="items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            backgroundColor: s.bg,
            marginRight: 12,
          }}>
          {step.state === 'locked' ? (
            <Icon name="lock" size={13} color={s.color} />
          ) : (
            <Text
              style={{
                color: s.color,
                fontFamily: 'Inter-SemiBold',
                fontSize: 13,
              }}>
              {s.mark || '•'}
            </Text>
          )}
        </View>
        <View className="flex-1" style={{minWidth: 0}}>
          <Text
            numberOfLines={1}
            className="text-keystone_navy font-inter-semibold"
            style={{fontSize: 15}}>
            {step.label}
          </Text>
          {step.sub ? (
            <Text
              numberOfLines={1}
              className="font-inter"
              style={{fontSize: 13, marginTop: 2, color: s.color}}>
              {step.sub}
            </Text>
          ) : null}
        </View>
        {onPress ? (
          <Icon name="chevron-right" size={16} color={COLORS.keystone_slate} />
        ) : null}
      </View>
      {!last && <Divider />}
    </Row>
  );
};

const OnboardingChecklist = () => {
  const nav = useNavigation();
  const authStatus = useAuthSession(s => s.status);
  const {status, isPending, isRefetching, error, refetch} = useOnboarding();
  const {resetState} = useGlobals(s => s);
  const {
    state: {auth},
  } = useGlobals(s => s);

  // Same contract as the Account sign-out: the secure-store deletion is
  // awaited before we navigate away, so the user is never shown the
  // signed-out front door while their refresh token is still on disk.
  const signOut = async () => {
    AuthServices.logout(auth?.refresh_token).catch(() => {});
    resetState();
    // Demo identity material must not outlive the session either. No-op
    // outside the demo journey; the photo is deleted from disk when there
    // is one.
    clearDemoIdentity().catch(() => {});
    try {
      await endSession();
    } catch (err) {
      toast.show(
        'Signed out on this device, but we could not erase the saved session.',
        toast.LONG,
      );
    }
    nav.navigate('welcome');
  };

  // A failed load must not be mistaken for a step of the journey.
  if (error && !status) {
    return (
      <Screen variant="hub" contentStyle={{paddingTop: 16}}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <HeroCard
          label="Setting up"
          amount="We can’t reach your application"
          amountSize={22}
          sub="Check your connection and try again. Nothing has changed."
        />
        <PrimaryButton
          label="Try again"
          onPress={refetch}
          style={{marginTop: 20}}
        />
        <Text
          onPress={signOut}
          className="text-keystone_slate font-inter text-sm text-center mt-6">
          Sign out
        </Text>
      </Screen>
    );
  }

  const steps = status?.steps ?? [];
  const primary = ACTION[status?.state];

  // The pre-move-in inspection is a TAB screen (My Home → checklist).
  // An authenticated ONBOARDED tenant already has the tabs mounted by
  // the navigation gate, so it's a plain navigate. The demo claim path
  // has no session — entering the home there requires the preview role;
  // setting it triggers the forceRole transition (navigation/Main.jsx),
  // which mounts the tabs, and the walk to the checklist follows once
  // the navigator exists. __DEV__-only, like the store it writes.
  const startInspection = () => {
    if (authStatus === AUTHENTICATED) {
      RootNavigation.navigate('my_home_stack', {screen: 'checklist'});
      return;
    }
    if (__DEV__) {
      useDevRoleStore.getState().setRole('tenant');
      setTimeout(
        () => RootNavigation.navigate('my_home_stack', {screen: 'checklist'}),
        500,
      );
    }
  };

  return (
    <Screen
      variant="hub"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isPending}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }
      contentStyle={{paddingTop: 16}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {status?.demo ? (
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
            Demo — no screening report is being pulled
          </Text>
        </View>
      ) : null}

      <HeroCard
        label={
          status?.property
            ? `${status.property} · ${status.space}`
            : 'Your application'
        }
        amount={isPending ? 'Loading…' : status?.title ?? ''}
        amountSize={22}
        sub={isPending ? '' : status?.body ?? ''}
      />

      <View className="mt-5">
        <SectionLabel>Your progress</SectionLabel>
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {steps.map((s, i) => (
            <StepRow
              key={s.key}
              step={s}
              last={i === steps.length - 1}
              // The step the journey is waiting ON THE APPLICANT for is
              // tappable and goes exactly where the CTA below goes — two
              // affordances, one destination. `primary` exists only for
              // actionable states, so waiting/locked rows never navigate.
              onPress={
                (s.state === 'active' || s.state === 'attention') && primary
                  ? () => nav.navigate(primary.route)
                  : undefined
              }
            />
          ))}
        </Card>
      </View>

      {status?.waiting ? (
        <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-4 px-1">
          You can close the app. We’ll notify you when your status changes.
        </Text>
      ) : null}

      {primary ? (
        <PrimaryButton
          label={primary.label}
          onPress={
            primary.inspection ? startInspection : () => nav.navigate(primary.route)
          }
          style={{marginTop: 20}}
        />
      ) : null}

      {status?.state === 'ADVERSE_ACTION' ? (
        <Card style={{marginTop: 20}}>
          <Text className="text-keystone_navy font-inter-semibold text-[15px]">
            Your rights
          </Text>
          <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
            You can ask for a free copy of the report used, and dispute anything
            in it that’s wrong. Your landlord must tell you which agency
            supplied it.
          </Text>
        </Card>
      ) : null}

      {status?.rentShare ? (
        <Text className="text-text_muted font-inter text-xs leading-5 mt-5 px-1">
          {usd(status.rentShare)}/month for {status.space} at {status.property},
          managed by {status.landlord}.
        </Text>
      ) : null}

      <Text
        onPress={() => nav.navigate('help')}
        className="text-keystone_gold font-inter-semibold text-sm text-center mt-6">
        Help
      </Text>
      <Text
        onPress={signOut}
        className="text-keystone_slate font-inter text-sm text-center mt-4">
        Sign out
      </Text>

      {/* Most of this journey is spent waiting on a screening provider or
          a landlord, so without a driver half of it is unreachable.
          Renders nothing outside __DEV__ + Fixtures. */}
      <DemoBar />

      {/* Room for the bar so it never covers Sign out. */}
      <View style={{height: 96}} />
    </Screen>
  );
};

// Only states the applicant can act on get a CTA. Waiting states get none
// — there is nothing for them to do, and a button would imply otherwise.
const ACTION = {
  INVITE_RECEIVED: {label: 'Start — tell us about you', route: 'onboarding__about'},
  ABOUT_YOU_REQUIRED: {label: 'Tell us about you', route: 'onboarding__about'},
  IDENTITY_REQUIRED: {
    label: 'Confirm it’s you',
    route: 'onboarding__identity',
  },
  SCREENING_CONSENT_REQUIRED: {
    label: 'Review the background check',
    route: 'onboarding__screening_consent',
  },
  SCREENING_NEEDS_INFORMATION: {
    label: 'See what’s needed',
    route: 'onboarding__screening_consent',
  },
  AGREEMENT_READY: {label: 'Review your agreement', route: 'onboarding__agreement'},
  // Signed and in: the journey's last act is walking the home BEFORE
  // moving furniture in — the condition record that protects the deposit.
  // No `route`: the inspection lives in the tenant tabs, so the handler
  // in the component decides how to get there (see startInspection).
  ONBOARDED: {label: 'Start your pre-move-in inspection', inspection: true},
};

export default OnboardingChecklist;
