import React from 'react';
import {ActivityIndicator, RefreshControl, StatusBar, Text, View} from 'react-native';
import {
  useComplianceAlerts,
  useComplianceAudit,
} from '../../hooks/useCompliance';
import {Card, Icon} from '../../components/premium';
import {
  HeroCard,
  Screen,
  SectionLabel,
  StatusChip,
  Timeline,
  eventDate,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {can} from '../../constants/capabilities';

// Compliance alerts (design 7d). Countdown chips escalate
// pending → danger as deadlines near. The design's decision row
// (Review draft / Skip increase) is intentionally absent — see the
// note at the urgent branch below.
// "We'll write them for you" reassurance carried from the Dashboard
// needs-you row (do-not-lose); the education footer explains the
// lawyer-reviewed-template mechanism. The audit trail stays — it's
// the timestamped proof every required notice went out.

const daysLeft = iso => {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
};

const Compliance = () => {
  const {alerts, isPending, isRefetching, refetch, error, loaded} =
    useComplianceAlerts();
  const {audit, loaded: auditLoaded} = useComplianceAudit();

  // An all-clear may only come from a SUCCESSFUL load. A failed request
  // yields an empty list, and "no alerts" and "we don't know" are the same
  // shape — so the screen used to answer a 404 with "All notices handled ·
  // Your audit trail is current." That is a legal reassurance invented from
  // a network error, on the one screen where being wrong means a missed
  // statutory deadline.
  const canReassure = loaded && !error;

  const pending = alerts.filter(a => a.status === 'NOT_SENT');
  const jurisdiction = pending[0]?.jurisdiction === 'WA' ? 'Washington' : pending[0]?.jurisdiction;
  const soonest = pending.length
    ? pending.reduce((min, a) => Math.min(min, daysLeft(a.deadline) ?? 99), 99)
    : null;

  const auditSteps = audit.map(e => ({
    title: e.action,
    sub: `${e.unitName} · ${e.regulation} · logged ${
      e.daysAgo === 0 ? 'today' : `${e.daysAgo}d ago`
    }`,
    state: 'done',
  }));

  return (
    <Screen
      title="Compliance"
      back="Reports"
      loadError={!isPending && error}
      onRetry={refetch}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="Notices due"
        badge={jurisdiction ? {text: jurisdiction} : undefined}
        // Three distinct states, never two. In flight is NOT the same as
        // failed: showing "Status unavailable" while the request is still
        // running told the landlord their compliance status was unknown
        // every single cold open, which trains them to ignore the one
        // message that matters when it is real.
        amount={
          isPending
            ? 'Checking…'
            : !canReassure
            ? 'Status unavailable'
            : pending.length === 0
            ? 'All notices handled'
            : `${pending.length} notice${pending.length === 1 ? '' : 's'}`
        }
        amountSize={28}
        sub={
          isPending
            ? 'Looking up your notice requirements.'
            : !canReassure
            ? 'We couldn’t check your notice requirements. Don’t treat this as all-clear — verify any deadlines yourself.'
            : pending.length === 0
            ? 'Nothing due, based on the notices Keystone tracks.'
            : 'HB 1217 requires 90-day notice for rent increases.'
        }
      />

      {/* Action needed — decision rows, countdown chips */}
      {pending.length > 0 && (
        <View className="mt-5">
          <SectionLabel>
            {soonest != null
              ? `Due before ${eventDate(
                  '',
                  new Date(Date.now() + soonest * 86400000),
                ).trim()}`
              : 'Action needed'}
          </SectionLabel>
          {pending.map((a, idx) => {
            const dl = daysLeft(a.deadline);
            const urgent = (dl ?? 99) <= 21;
            return (
              <Card key={a.id} style={{marginBottom: 12}}>
                <View className="flex-row items-center" style={{minWidth: 0}}>
                  <View
                    style={{backgroundColor: 'rgba(205,160,0,0.12)'}}
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3">
                    <Icon name="scale" size={19} color={COLORS.c_pending} />
                  </View>
                  <View className="flex-1" style={{minWidth: 0}}>
                    <Text
                      numberOfLines={1}
                      className="text-keystone_navy font-inter-semibold text-base">
                      {a.unitName} · rent increase notice
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-text_muted font-inter text-xs mt-0.5">
                      {eventDate('send by', a.deadline)} · {a.regulation}
                    </Text>
                  </View>
                  <View style={{flexShrink: 0, maxWidth: '35%'}}>
                    <StatusChip
                      label={dl < 0 ? `${Math.abs(dl)}d over` : `${dl} days`}
                      tone={dl < 0 ? 'danger' : urgent ? 'pending' : 'neutral'}
                    />
                  </View>
                </View>
                {/* The decision row is REMOVED, not relabelled.
                    "Review draft" called the send mutation directly — it
                    dispatched a legally consequential notice while the
                    label promised a preview — and "Skip increase" claimed
                    a recorded decision from a local toast. Neither had a
                    preview, recipient/address check, delivery method,
                    separate Send step, confirmation, or server audit
                    record. Restore this row only when all of those exist.
                    The deadline above stays: the tracking is real and
                    useful even while sending is not available in-app. */}
                {urgent && !can('complianceNotices') && (
                  <Text className="text-keystone_slate font-inter text-xs leading-5 mt-3">
                    Sending notices from the app isn’t available yet. Send
                    this notice through your usual process before the
                    deadline.
                  </Text>
                )}
              </Card>
            );
          })}
        </View>
      )}

      {/* Claimed nationwide coverage and "lawyer-reviewed" templates.
          Neither is true today: only WA HB 1217 is modelled, the drafting
          endpoint does not exist, and no counsel has reviewed the copy
          (see the DRAFT banner in constants/legalCopy). Overstating legal
          coverage on a compliance screen is the same class of defect as a
          false all-clear. */}
      <Text className="text-keystone_slate font-inter text-xs leading-5 mt-1">
        Keystone tracks rent-increase notice deadlines for Washington
        (HB 1217). Confirm your own obligations — Keystone doesn’t provide
        legal advice, and doesn’t send notices for you.
      </Text>

      {/* Audit trail — proof it happened */}
      {auditLoaded && audit.length > 0 && (
        <View className="mt-5">
          <SectionLabel>Audit trail · proof it happened</SectionLabel>
          <Card>
            <Timeline steps={auditSteps} />
          </Card>
        </View>
      )}

      {isPending && (
        <View className="items-center justify-center py-8">
          <ActivityIndicator color={COLORS.keystone_navy} />
        </View>
      )}
    </Screen>
  );
};

export default Compliance;
