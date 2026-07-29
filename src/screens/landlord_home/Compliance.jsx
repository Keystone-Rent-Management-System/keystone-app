import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {
  useComplianceAlerts,
  useComplianceAudit,
  useSendComplianceNotice,
} from '../../hooks/useCompliance';
import {Card, Icon} from '../../components/premium';
import {
  HeroCard,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
  StatusChip,
  Timeline,
  eventDate,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Compliance alerts (design 7d). Countdown chips escalate
// pending → danger as deadlines near; the urgent item gets the
// decision row (Review draft / Skip increase), quiet ones stay quiet.
// "We'll write them for you" reassurance carried from the Dashboard
// needs-you row (do-not-lose); the education footer explains the
// lawyer-reviewed-template mechanism. The audit trail stays — it's
// the timestamped proof every required notice went out.

const daysLeft = iso => {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
};

const Compliance = () => {
  const {alerts, isPending, isRefetching, refetch} = useComplianceAlerts();
  const {audit} = useComplianceAudit();
  const sendMut = useSendComplianceNotice();

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
        amount={
          pending.length === 0
            ? 'All notices handled'
            : `${pending.length} notice${pending.length === 1 ? '' : 's'}`
        }
        amountSize={28}
        sub={
          pending.length === 0
            ? 'Nothing due. Your audit trail is current.'
            : "HB 1217 requires 90-day notice for rent increases — we'll write them for you."
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
                {/* Decision row — only the urgent item gets it (7d) */}
                {urgent && (
                  <View className="flex-row gap-3 mt-4">
                    <PrimaryButton
                      label="Review draft"
                      style={{flex: 1, minHeight: 44}}
                      disabled={sendMut.isPending}
                      onPress={() => sendMut.mutate(a.id)}
                    />
                    <SecondaryButton
                      label="Skip increase"
                      style={{flex: 1, minHeight: 44}}
                      onPress={() =>
                        ToastAndroid.show(
                          'Increase skipped — no notice needed',
                          ToastAndroid.SHORT,
                        )
                      }
                    />
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      )}

      <Text className="text-keystone_slate font-inter text-xs leading-5 mt-1">
        Keystone tracks notice requirements for every state your properties are
        in. Drafts use the state's required language — a lawyer-reviewed
        template, filled with your numbers.
      </Text>

      {/* Audit trail — proof it happened */}
      {audit.length > 0 && (
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
