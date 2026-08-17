import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';

import {useTenantInsurance} from '../../hooks/useTenantHome';
import {Card, Divider, Row} from '../../components/premium';
import {
  HeroCard,
  Screen,
  SecondaryButton,
  SectionLabel,
  StatusChip,
  eventDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {can} from '../../constants/capabilities';

// Renters insurance + proof form (design 6h). The COVERED chip no
// longer clips (H3); the partner is named in the sub-line and the
// headline is the coverage, not the brand string. The proof-of-policy
// form is removed while §T11 is unavailable — see the note at the
// proof card.

const Insurance = () => {
  const {insurance, isPending, isRefetching, refetch, error} =
    useTenantInsurance();

  // FOUR STATES, never fewer.
  //
  // "Not covered" is a factual claim about someone's insurance, and a
  // tenant whose lease requires cover can act on it. It must be reached
  // only by a successful response that actually said so — never by a
  // disabled capability and never by a failed request, both of which
  // previously collapsed into the same else-branch.
  //
  //   unavailable  Keystone doesn't offer this at all.
  //   failed       We asked and could not find out.
  //   covered      The server said COVERED.
  //   notCovered   The server said something else.
  const state = !can('rentInsurance')
    ? 'unavailable'
    : error
      ? 'failed'
      : insurance?.status == null
        ? 'failed'
        : insurance.status === 'COVERED'
          ? 'covered'
          : 'notCovered';

  const covered = state === 'covered';
  const proof = insurance?.proof ?? {status: 'NONE'};

  const onFile = !!(proof.status && proof.status !== 'NONE');



  // PROOF SUBMISSION IS DISABLED — there is no endpoint behind it.
  // The previous version ran an empty `try {}`, then set `onFile`, wiped
  // the form and said "Proof submitted — pending verification". A tenant
  // whose lease requires proof of renters insurance would believe they
  // had complied, and could be in breach without knowing. BE returns 501
  // for §T11 (no insurer partner), so this stays off until it ships.

  return (
    <Screen
      title="Renters insurance"
      back="Account"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {/* `known` was computed but the render only branched on `covered`,
          so every error and every unavailable state fell into the else —
          producing a definite "Not covered" badge, "Protect your stuff"
          and "get covered in minutes" for a tenant whose status nobody
          knows. Three states, not two. */}
      {state === 'unavailable' ? (
        <HeroCard
          label="Renters insurance"
          amount="Not available yet"
          amountSize={24}
          sub="Keystone doesn’t track renters insurance yet. Your lease may still require it."
        />
      ) : isPending ? (
        <HeroCard
          label="Renters insurance"
          amount="Checking…"
          amountSize={24}
          sub="Looking up your cover."
        />
      ) : state === 'failed' ? (
        <HeroCard
          label="Renters insurance"
          amount="Status unknown"
          amountSize={24}
          sub="We couldn’t check your renters insurance. Ask your insurer or your landlord."
        />
      ) : covered ? (
        <HeroCard
          label="Renters insurance"
          badge={{text: 'Covered', dot: 'success'}}
          amount={`${usd(insurance?.personalProperty)} covered`}
          amountSize={28}
          sub={`${insurance?.provider ?? '—'} · ${usd(insurance?.monthlyPremium)}/mo${
            insurance?.renewsOn
              ? ` · ${eventDate('renews', insurance.renewsOn)}`
              : ''
          }`}
        />
      ) : (
        <HeroCard
          label="Renters insurance"
          badge={{text: 'Not covered', dot: 'danger'}}
          amount="No policy on file"
          amountSize={26}
          sub="Your lease may require renters insurance. Arrange it with an insurer."
        />
      )}

      {covered && (
        <View className="mt-4">
          <Card>
            <Row label="Personal property" value={usd(insurance?.personalProperty)} />
            <Divider />
            <Row label="Liability" value={usd(insurance?.liability)} />
            <Divider />
            <Row label="Deductible" value={usd(insurance?.deductible)} />
          </Card>
          {/* Filing a claim has no handoff and no partner behind it; the
              button only toasted. At the moment a renter has actually had
              a loss, an interactive-looking claim button that does nothing
              is the worst possible time to discover that. */}
          <SecondaryButton
            label="File a claim"
            style={{marginTop: 12}}
            disabled
          />
          <Text className="text-keystone_slate font-inter text-xs leading-5 mt-3">
            Claims aren’t handled in the app. Contact your insurer directly
            using the details on your policy.
          </Text>
        </View>
      )}

      {/* Proof of an outside policy */}
      <View className="mt-5">
        <SectionLabel>Insured elsewhere?</SectionLabel>
        {onFile ? (
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-keystone_navy font-inter-semibold text-[15px]">
                Proof on file
              </Text>
              <StatusChip
                label={proof.status === 'VERIFIED' ? 'Verified' : 'Pending review'}
                tone={proof.status === 'VERIFIED' ? 'success' : 'pending'}
              />
            </View>
            <Text className="text-keystone_slate font-inter text-xs mt-2 leading-5">
              Your landlord's compliance record shows your outside policy.
              Submit again if it renews or changes.
            </Text>
          </Card>
        ) : (
          /* THE FORM IS GONE, not merely disabled. It asked for the
             carrier, the expiry date and a photo of the declarations page
             — then revealed at the very end that submission is
             unavailable. That is the same PII funnel removed from KYC:
             the gate has to precede the collection, so there is nothing
             to collect. Restore with BE §T11 (501 today — no insurer
             partner). */
          <Card>
            <Text className="text-keystone_navy font-inter-semibold text-[15px]">
              Sending proof isn’t available yet
            </Text>
            <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
              Your lease may still require renters insurance. Send your policy
              to your landlord the way you normally would — we’re not asking
              for it here, and nothing has been collected.
            </Text>
          </Card>
        )}
      </View>

    </Screen>
  );
};

export default Insurance;
