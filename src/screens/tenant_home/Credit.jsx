import React, {useEffect, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {
  Card,
  Label,
  Divider,
  Icon,
  IconChip,
  Ring,
  Sparkline,
  DraftBadge,
  ConsentRow,
  LegalLink,
} from '../../components/premium';
import COLORS from '../../constants/Theme';
import {CREDIT_REPORTING} from '../../constants/legalCopy';

// Credit building (FCRA — aggregator model). Keystone is NOT the furnisher;
// a reporting partner is. Our job: capture the tenant's express opt-in
// consent, disclose the downside truthfully (late/missed rent can lower the
// score), and route disputes to the partner. Reporting defaults OFF until the
// tenant opts in — the BE returns credit.enabled=false for an un-enrolled
// tenant. Score 300–850 mapped onto the Ring (0–100%).

const scoreToPct = s => Math.max(0, Math.min(100, Math.round(((s - 300) / 550) * 100)));

const Credit = () => {
  const {home, isPending, isRefetching, refetch} = useTenantHome();
  const credit = home?.credit ?? {};

  // `enrolled` reflects the server's consent state. `consent` is the local
  // checkbox the tenant must tick before we flip enrollment on.
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
    // PATCH /tenants/credit { enabled: true, consentAt: <now> } — the BE must
    // persist the consent timestamp as the FCRA authorization record.
    setEnrolled(true);
    ToastAndroid.show('Rent reporting on', ToastAndroid.SHORT);
  };

  const pause = () => {
    setEnrolled(false);
    setConsent(false);
    ToastAndroid.show('Rent reporting paused', ToastAndroid.SHORT);
  };

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        {/* Hero — score when enrolled, the pitch when not */}
        <View className="px-4 pt-5">
          <Card feature>
            {enrolled ? (
              <>
                <Label onDark>Your credit · {credit.band ?? '—'}</Label>
                <View className="flex-row items-center mt-3">
                  <Ring
                    percent={scoreToPct(credit.score ?? 300)}
                    size={120}
                    thickness={11}
                    color={COLORS.keystone_gold}
                    trackColor="rgba(255,255,255,0.14)"
                    centerValue={credit.score ?? '—'}
                    centerLabel="score"
                    centerColor="#FFFFFF"
                  />
                  <View className="flex-1 ml-4">
                    <Text className="text-c_success font-inter-bold text-lg">
                      ▲ {credit.delta ?? 0} pts
                    </Text>
                    <Text className="text-white/60 font-inter text-xs mt-0.5">
                      since you joined Keystone
                    </Text>
                    <Text className="text-white font-inter-semibold text-sm mt-3">
                      {credit.streakMonths ?? 0} months on time
                    </Text>
                    <Text className="text-white/55 font-inter text-xs mt-0.5">
                      every payment counts
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Label onDark>Build credit with rent</Label>
                <Text className="text-white font-inter-bold text-2xl mt-2">
                  Make your rent count
                </Text>
                <Text className="text-white/60 font-inter text-sm mt-1 leading-5">
                  Rent is most people’s biggest monthly payment — but it usually
                  builds nothing. Turn on reporting and your rent can help build
                  your credit.
                </Text>
              </>
            )}
          </Card>
        </View>

        {/* Streak — only meaningful once enrolled with history */}
        {enrolled && credit.history?.length > 1 && (
          <View className="px-4 mt-4">
            <Card>
              <View className="flex-row items-center justify-between mb-3">
                <Label>Your score trend</Label>
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

        {/* Consent + disclosure (FCRA) */}
        <View className="px-4 mt-4">
          <Card>
            <View className="flex-row items-center gap-3">
              <IconChip>
                <Icon name="trending" size={19} color={COLORS.keystone_gold} />
              </IconChip>
              <View className="flex-1">
                <Text className="text-keystone_navy font-inter-semibold text-sm">
                  {enrolled ? CREDIT_REPORTING.enrolledLabel : CREDIT_REPORTING.consentTitle}
                </Text>
                <Text className="text-text_muted font-inter text-xs mt-0.5">
                  Reported to {(credit.reportedTo ?? ['TransUnion', 'Equifax']).join(' & ')} via{' '}
                  {CREDIT_REPORTING.partnerName}
                </Text>
              </View>
            </View>

            <Divider style={{marginVertical: 12}} />
            <DraftBadge />
            <Text className="text-text_muted font-inter text-xs leading-5">
              {CREDIT_REPORTING.disclosure}
            </Text>

            {enrolled ? (
              <>
                <Divider style={{marginVertical: 12}} />
                <Text className="text-text_muted font-inter text-xs leading-5">
                  {CREDIT_REPORTING.disputeText}
                </Text>
                <View className="mt-2">
                  <LegalLink label={CREDIT_REPORTING.disputeCta} url={CREDIT_REPORTING.disputeUrl} />
                </View>
                <TouchableOpacity
                  onPress={pause}
                  activeOpacity={0.85}
                  className="border border-keystone_navy rounded-2xl py-3.5 items-center mt-4">
                  <Text className="text-keystone_navy font-inter-semibold text-sm">
                    {CREDIT_REPORTING.pauseCta}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <ConsentRow checked={consent} onToggle={() => setConsent(c => !c)}>
                  {CREDIT_REPORTING.consentCheckbox}
                </ConsentRow>
                <TouchableOpacity
                  onPress={enroll}
                  disabled={!consent}
                  activeOpacity={0.9}
                  style={{opacity: consent ? 1 : 0.5}}
                  className="bg-keystone_navy rounded-2xl py-4 items-center mt-4">
                  <Text className="text-white font-inter-bold text-base">
                    {CREDIT_REPORTING.enrollCta}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        </View>

        {isPending && !home && (
          <View className="px-4 mt-4">
            <Text className="text-text_muted font-inter text-sm ml-1">Loading…</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Credit;
