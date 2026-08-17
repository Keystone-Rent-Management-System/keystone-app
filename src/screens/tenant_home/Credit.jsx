import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {
  Card,
  Divider,
  Icon,
  IconChip,
  Sparkline,
} from '../../components/premium';
import {
  HeroCard,
  Screen,
  SectionLabel,
  StatusChip,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {can} from '../../constants/capabilities';

// Credit building (design 2g). OFF state sells the outcome with the
// streak the user already owns (T3: an empty card with no next step
// is banned); full FCRA consent copy stays visible per L1–L2 and the
// CTA holds the K3 disabled state until the box is checked. Keystone
// is NOT the furnisher — a reporting partner is; disputes route to
// the partner.

const ValueLine = ({children}) => (
  <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6}}>
    <Text style={{color: '#037147', fontFamily: 'Inter-SemiBold', fontSize: 15}}>✓</Text>
    <Text
      style={{
        flex: 1,
        color: COLORS.keystone_navy,
        fontFamily: 'Inter',
        fontSize: 15,
        lineHeight: 21,
      }}>
      {children}
    </Text>
  </View>
);

const Credit = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const credit = home?.credit ?? {};

  // Structural gate: while the capability is false the "reporting on"
  // surface is unreachable by construction, so no fixture or backend
  // payload can make the app claim rent is being reported.
  const enrolled = can('creditReporting') && (credit.enabled ?? false);

  // CREDIT REPORTING CANNOT BE TURNED ON OR OFF HERE — both handlers only
  // set local state and toasted. Two distinct harms: a tenant believed
  // their rent was being reported to a bureau and it was not, and the
  // FCRA authorization they gave was never persisted anywhere, so there
  // is no consent record behind a consumer-reporting action. Restore with
  // BE §T9 (GET/PATCH /tenants/credit) storing consent timestamp,
  // document version and user, and a server-confirmed enrolment state.

  const streak = credit.streakMonths ?? 0;

  return (
    <Screen
      title="Credit building"
      back="Account"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {enrolled ? (
        <>
          {/* ON — hero rebuilt on the contract (6d): score ring →
              headline number + delta (H3/H4); "every payment counts"
              no longer clips at the card bottom. */}
          <HeroCard
            label={`Your credit · ${credit.band ?? '—'}`}
            badge={{text: 'Not available', tone: 'neutral'}}
            amount={`${credit.score ?? '—'}`}
            amountSize={40}
            sub={`▲ ${credit.delta ?? 0} pts since you joined Keystone · ${streak} months on time, every payment counts.`}
          />

          {credit.history?.length > 1 && (
            <View className="mt-4">
              <Card>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-keystone_slate font-inter-semibold text-xs uppercase tracking-widest">
                    Score trend
                  </Text>
                  <Text className="text-text_muted font-inter text-xs">
                    last {credit.history.length} months
                  </Text>
                </View>
                <View className="items-center">
                  <Sparkline
                    data={credit.history}
                    width={300}
                    height={56}
                    lastColor={COLORS.keystone_gold}
                  />
                </View>
              </Card>
            </View>
          )}

          {/* The pause control and the dispute link are gone: pausing
              only set local state, and the dispute route depends on a
              furnisher that does not exist. Telling someone how to dispute
              a report through a partner we have not signed is worse than
              silence. */}

        </>
      ) : (
        <>
          {/* OFF — sell the outcome with the streak the user already
              owns (2g). */}
          <HeroCard
            label="Rent reporting"
            badge={{text: 'Off'}}
            amount={
              streak > 0
                ? "You're already paying on time. Make it count."
                : 'Make your rent count.'
            }
            amountSize={24}
            // "+18 pts on average in the first 9 months" was an unsourced
            // performance claim about a consumer credit product — the kind
            // of statement that needs substantiation before it is made,
            // not after.
            sub="Rent reporting isn’t available in Keystone yet."
          />

          {/* Named "TransUnion & Equifax via our credit-reporting
              partner" — a specific bureau and furnisher commitment with no
              partner signed. Kept only what is true of the concept. */}
          <Card style={{marginTop: 16}}>
            <ValueLine>
              Only payments made going forward — never your history
            </ValueLine>
            <ValueLine>Turn it off anytime</ValueLine>
          </Card>

          {/* The tickable FCRA authorization is REMOVED, not disabled. It
              took a consumer-reporting consent that was never transmitted
              or stored, so there was no record of what the tenant agreed
              to or against which disclosure version — and it sat above a
              dead button, which is a consent request for nothing. The
              disclosure stays readable as plain copy. */}
          <Card style={{marginTop: 16}}>
            <Text className="text-keystone_navy font-inter-semibold text-[15px]">
              Not available yet
            </Text>
            <Text className="text-keystone_slate font-inter text-[13px] leading-5 mt-1">
              Rent reporting isn’t something you can turn on today, and nothing
              is being reported in the meantime. We’ll tell you when it’s ready
              and ask for your permission then.
            </Text>
          </Card>
        </>
      )}
    </Screen>
  );
};

export default Credit;
