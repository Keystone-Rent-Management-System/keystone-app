import React from 'react';
import {StatusBar, Text, View} from 'react-native';

import {Card} from '../../../components/premium';
import {PrimaryButton, Screen} from '../../../components/kit';
import COLORS from '../../../constants/Theme';

// Screening — applicant side, FCRA consent step (design 4d, NEW
// feature). Screening consent is FCRA-sensitive: the full copy stays
// Screening is unavailable, so this route is informational only: it
// explains what a background check would involve and what rights the
// applicant would have. It takes no authorization and stores nothing.

// Was written as a live authorization — "By continuing, you authorize
// Keystone and its consumer-reporting partner to obtain your credit
// report…" — on a screen titled "Your consent". There is no continuation,
// no partner, and nothing is stored, so the sentence asserted an
// authorization that could not exist. Removing the checkbox left the
// wording behind, which is arguably worse: it reads as consent already
// given. Rewritten as forward-looking explanation until the real flow and
// its counsel-reviewed wording exist.
const INFO_COPY =
  'If screening becomes available, you’ll be asked for your permission ' +
  'before anything runs. A consumer-reporting agency would look at your ' +
  'credit, eviction history and background records to help the landlord ' +
  'decide. You would be able to get a copy of that report and dispute ' +
  'anything wrong in it, and the landlord would have to tell you if their ' +
  'decision went against you because of it.';

const ScreeningConsent = ({route}) => {
  const unitLabel =
    route?.params?.unitLabel ?? 'Unit 7C · 128 Magnolia Ave, Austin, TX';

  return (
    <Screen
      title="Background checks"
      back="Application"
      /* DISABLED. This collected an applicant's FCRA authorization to
            pull consumer reports and then said "Screening started" from a
            toast — no screening request, and no consent record persisted
            anywhere. Consent that is solicited but never stored is worse
            than no consent screen at all: the applicant believes they
            authorised a specific permissible-purpose pull, and there is no
            evidence of what they agreed to, when, or against which
            disclosure version. Restore only with a real screening request,
         a stored consent record (document version, timestamp, applicant,
         permissible purpose) and the adverse-action workflow. */
      stickyFooter={
        <View>
          <PrimaryButton label="Run my screening" disabled />
          <Text
            style={{
              color: COLORS.keystone_slate,
              fontFamily: 'Inter',
              fontSize: 12,
              lineHeight: 18,
              marginTop: 12,
              textAlign: 'center',
            }}>
            Screening isn’t available yet. Nothing on this screen has been
            submitted or recorded.
          </Text>
        </View>
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter-SemiBold',
          fontSize: 11,
          letterSpacing: 0.9,
          marginBottom: 8,
        }}>
        STEP 3 OF 3
      </Text>
      <Text
        style={{
          color: COLORS.keystone_navy,
          fontFamily: 'Inter-Bold',
          fontSize: 28,
          letterSpacing: -0.3,
          marginBottom: 6,
        }}>
        About background checks
      </Text>
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter',
          fontSize: 15,
          lineHeight: 22,
          marginBottom: 12,
        }}>
        Applying for {unitLabel}
      </Text>

      {/* The tickable FCRA authorization, the green completion
          checkmarks and the "Summary of your FCRA rights" link are all
          removed while screening is unavailable:
            · the checkbox took an authorization to pull consumer reports
              that was never transmitted or stored, so no acceptance
              evidence existed for what the applicant agreed to;
            · the checkmarks were hardcoded, asserting an identity check
              and income documents that no applicant had completed;
            · the link only toasted "Opens the CFPB FCRA summary" — a
              disclosure the law expects to be readable, that opened
              nothing.
          The disclosure text stays visible as plain, non-actionable copy
          so the screen still explains what screening would involve. */}
      <Card>
        <Text
          style={{
            color: COLORS.keystone_slate,
            fontFamily: 'Inter',
            fontSize: 13,
            lineHeight: 20,
          }}>
          {INFO_COPY}
        </Text>
      </Card>
    </Screen>
  );
};

export default ScreeningConsent;
