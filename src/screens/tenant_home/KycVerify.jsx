import React from 'react';
import {StatusBar, Text} from 'react-native';

import {HeroCard, Screen} from '../../components/kit';
import {can} from '../../constants/capabilities';

// KYC — verify identity (design 5d).
//
// The form is GONE, not merely disabled, and that is deliberate.
//
// What it used to do: walk the tenant through three steps collecting their
// legal name, date of birth, the last four digits of their Social Security
// number and their home address — then run an empty `try {}` and report
// "Identity submitted — connecting your bank next". Nothing left the
// device. The SSN field's helper text read "Encrypted and sent only to
// Dwolla, our payment processor", which was false in both halves: nothing
// was encrypted in transit because nothing was transmitted at all.
//
// Disabling only the submit button was not enough. That still asks a person
// for their SSN under a false pretext and admits only at the end that the
// feature does not exist. The gate has to come before the collection, so
// there is nothing to collect. The entry point in PaymentMethods is closed
// for the same reason.
//
// The route stays registered (Main.jsx) so an existing deep link lands
// somewhere truthful rather than on a missing screen.
//
// Restore with BE §T12: POST /tenants/kyc backed by Dwolla customer
// verification, plus the states a real identity check needs — manual
// review, mismatch, retry, document upload — and a storage claim verified
// against transport, logging, analytics and crash reporting before it is
// printed on screen again.

const KycVerify = () => (
  // Bound to the flag: if identity verification is ever enabled without
  // this screen being rebuilt, the mismatch is visible immediately
  // rather than shipping a form with no endpoint behind it.
  <Screen title="Verify identity" back="Payment methods">
    <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

    <HeroCard
      label="One-time check"
      amount={can('identityVerification') ? 'Confirm it’s you' : 'Not available yet'}
      amountSize={24}
      sub={
        can('identityVerification')
          ? 'Federal law requires payment providers to verify identity.'
          : 'Verifying your identity is part of connecting a bank, which isn’t ready yet.'
      }
    />

    {/* The body has to move with the hero. In Fixtures mode
        `identityVerification` flips true and the hero became "Confirm
        it's you" while this paragraph still said "we're not asking for
        any of it today" — a contradiction the demo itself introduced,
        on a screen about what data we collect. */}
    <Text className="text-keystone_slate font-inter text-[15px] leading-6 mt-5">
      {can('identityVerification')
        ? 'We’ll ask for your date of birth, the last four digits of your Social Security number, and your address — the checks federal law requires of payment providers.'
        : 'When it’s ready we’ll ask for your date of birth, the last four digits of your Social Security number, and your address — the checks federal law requires of payment providers. We’re not asking for any of it today, and nothing has been collected or stored.'}
    </Text>
  </Screen>
);

export default KycVerify;
