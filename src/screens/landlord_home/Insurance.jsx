import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';
import {useInsurance} from '../../hooks/useInsurance';
import {demoOnly, mockInsuranceClaims} from '../../services/mocks';
import {Card} from '../../components/premium';
import {
  HeroCard,
  ListRow,
  Screen,
  SecondaryButton,
  SectionLabel,
  eventDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {can} from '../../constants/capabilities';

// Rent insurance, landlord (design 7c). The hero answers "how much of
// my rent is protected"; claim rows verb-date the whole lifecycle
// (filed → payout → sent, D2). The education line covers the
// automatic-coverage model; File a claim is secondary — this is a
// monitoring screen, claims are rare.

const Insurance = () => {
  // Landlord insurance is 501 on BE — no insurer partner, so there is no
  // claims data source. Fixtures mode only; live shows the no-claims state.
  // demoOnly alone still rendered two invented claims (with payouts and
  // dates) in Fixtures mode, for a product with no insurer. Gate on the
  // capability as well, so the claim rows cannot exist while it is off.
  const claims = can('rentInsurance') ? demoOnly(mockInsuranceClaims, []) : [];
  const {insurance, isRefetching, refetch, error} = useInsurance();

  // RENT INSURANCE DOES NOT EXIST. BE answers 501 for §8 — there is no
  // insurer partner, therefore no policy, no covered units and no claims
  // data source. The screen nevertheless rendered an "Active" badge, an
  // insured-unit count derived from `?? 0`, "coverage is working quietly"
  // and a promise that coverage "applies automatically to every unit".
  // A landlord could believe their rent was insured and not buy cover.
  // Absence of data is not evidence of coverage.
  // Structural, not just data-driven: while the capability is false the
  // coverage branch is unreachable by construction, so no data shape can
  // resurrect an "Active" badge.
  const hasCoverage =
    can('rentInsurance') && !error && insurance?.status === 'ACTIVE';

  return (
    <Screen
      title="Rent insurance"
      back="Reports"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {hasCoverage ? (
        <HeroCard
          label="Units covered"
          badge={{text: 'Active', dot: 'success'}}
          amount={`${insurance.insuredUnits} units`}
          sub={`of ${insurance.occupiedUnits ?? insurance.totalUnits} occupied`}
        />
      ) : (
        <HeroCard
          label="Rent insurance"
          amount="Not available yet"
          amountSize={22}
          sub="Keystone doesn’t insure your rent today. If you want cover, arrange it yourself."
        />
      )}

      <View className="mt-5">
        <SectionLabel>Claims</SectionLabel>
        {claims.length === 0 ? (
          <Card>
            {/* Was a green "✓ No claims — coverage is working quietly",
                which reads an empty list as proof that cover is in force.
                With no policy behind it, zero claims means nothing. */}
            <Text className="text-keystone_slate font-inter text-sm text-center py-4">
              {hasCoverage
                ? 'No claims on your policy.'
                : 'No claims — there’s no policy to claim against.'}
            </Text>
          </Card>
        ) : (
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            {claims.map((c, i) => (
              <ListRow
                key={c.id}
                icon="shield"
                title={c.unitName}
                sub={
                  c.status === 'PAID_OUT'
                    ? `${eventDate('Filed', c.filedOn)} · payout ${usd(c.payout)} · ${eventDate('sent', c.paidOn)}`
                    : `${eventDate('Filed', c.filedOn)} · under review`
                }
                chip={
                  c.status === 'PAID_OUT'
                    ? {label: 'Paid out', tone: 'success'}
                    : {label: 'In review', tone: 'pending'}
                }
                last={i === claims.length - 1}
              />
            ))}
          </Card>
        )}
        <Text className="text-keystone_slate font-inter text-xs mt-3 leading-5">
          {hasCoverage
            ? 'Cover applies to the units listed on your policy.'
            : 'Rent insurance isn’t part of Keystone yet. Nothing here is insured.'}
        </Text>
      </View>

      {/* Claims had no handoff and no partner; the button only toasted. */}
      <SecondaryButton label="File a claim" style={{marginTop: 16}} disabled />
    </Screen>
  );
};

export default Insurance;
