import React, {useEffect, useState} from 'react';
import {
  RefreshControl,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {
  Card,
  Divider,
  Icon,
  IconChip,
  Sparkline,
  LegalLink,
} from '../../components/premium';
import {
  ConsentBlock,
  HeroCard,
  PrimaryButton,
  Screen,
  SectionLabel,
  StatusChip,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {CREDIT_REPORTING} from '../../constants/legalCopy';

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

  const [enrolled, setEnrolled] = useState(credit.enabled ?? false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setEnrolled(credit.enabled ?? false);
  }, [credit.enabled]);

  const enroll = () => {
    if (!consent) {
      ToastAndroid.show('Please check the box to authorize reporting', ToastAndroid.SHORT);
      return;
    }
    // PATCH /tenants/credit { enabled: true, consentAt: <now> } — the BE
    // must persist the consent timestamp as the FCRA authorization record.
    setEnrolled(true);
    ToastAndroid.show('Rent reporting on', ToastAndroid.SHORT);
  };

  const pause = () => {
    setEnrolled(false);
    setConsent(false);
    ToastAndroid.show('Rent reporting paused', ToastAndroid.SHORT);
  };

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
            badge={{text: 'Reporting on', dot: 'success'}}
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

          <View className="mt-4">
            <ConsentBlock copy={CREDIT_REPORTING.disclosure}>
              <Divider style={{marginVertical: 12}} />
              <Text className="text-text_muted font-inter text-xs leading-5">
                {CREDIT_REPORTING.disputeText}
              </Text>
              <View className="mt-2">
                <LegalLink
                  label={CREDIT_REPORTING.disputeCta}
                  url={CREDIT_REPORTING.disputeUrl}
                />
              </View>
              <TouchableOpacity
                onPress={pause}
                activeOpacity={0.85}
                className="border border-keystone_navy rounded-2xl py-3.5 items-center mt-4">
                <Text className="text-keystone_navy font-inter-semibold text-sm">
                  {CREDIT_REPORTING.pauseCta}
                </Text>
              </TouchableOpacity>
            </ConsentBlock>
          </View>
        </>
      ) : (
        <>
          {/* OFF — sell the outcome with the streak the user already
              owns (2g). */}
          <HeroCard
            label="Build credit with rent"
            badge={{text: 'Off'}}
            amount={
              streak > 0
                ? "You're already paying on time. Make it count."
                : 'Make your rent count.'
            }
            amountSize={24}
            sub={`Renters like ${home?.tenant?.firstName ?? 'you'} gain +18 pts on average in the first 9 months.`}
          />

          <Card style={{marginTop: 16}}>
            <ValueLine>
              Reported to TransUnion & Equifax via our credit-reporting partner
            </ValueLine>
            <ValueLine>
              Only payments made going forward — never your history
            </ValueLine>
            <ValueLine>Turn it off anytime</ValueLine>
          </Card>

          <View className="mt-4">
            <ConsentBlock
              copy={CREDIT_REPORTING.disclosure}
              checked={consent}
              onToggle={() => setConsent(c => !c)}
              agreeText={CREDIT_REPORTING.consentCheckbox}>
              <PrimaryButton
                label={CREDIT_REPORTING.enrollCta}
                disabled={!consent}
                onPress={enroll}
                style={{marginTop: 16}}
              />
            </ConsentBlock>
          </View>
        </>
      )}
    </Screen>
  );
};

export default Credit;
