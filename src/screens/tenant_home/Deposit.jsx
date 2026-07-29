import React from 'react';
import {StatusBar, Text, View} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Divider, Row, Icon, IconChip} from '../../components/premium';
import {
  HeroCard,
  Screen,
  SectionLabel,
  Timeline,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Security deposit (design 6f; quality bar, light pass). Structure
// and education copy kept verbatim (do-not-lose). Fixes: timeline
// states follow 1g (gold current with halo — was a filled dot reading
// as "done"); condition/checklist facts fold into the hero sub-line;
// the PROTECTED chip is bounded (H3).

const RETURN_STEPS = [
  {key: 'HELD', label: 'Held safely', sub: 'Secured for your tenancy'},
  {key: 'NOTICE_GIVEN', label: 'Notice given', sub: 'Move-out date set'},
  {key: 'INSPECTION', label: 'Move-out inspection', sub: 'Compared to your move-in photos'},
  {key: 'REFUNDED', label: 'Refund issued', sub: 'Sent to your bank'},
];

const fmtDate = iso => {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
};

const Deposit = () => {
  const {home} = useTenantHome();
  const deposit = home?.deposit ?? {};
  const lease = home?.lease ?? {};
  const ret = deposit.return ?? {status: 'HELD'};
  const activeIdx = Math.max(
    0,
    RETURN_STEPS.findIndex(s => s.key === ret.status),
  );

  const steps = RETURN_STEPS.map((step, i) => ({
    title: i === activeIdx ? `${step.label} — current` : step.label,
    sub:
      step.key === 'REFUNDED'
        ? `Sent to your bank within ${deposit.refundDays ?? 14} days`
        : step.sub,
    state: i < activeIdx ? 'done' : i === activeIdx ? 'current' : 'upcoming',
  }));

  return (
    <Screen title="Security deposit" back="My Home">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="Security deposit held"
        badge={{text: 'Protected', dot: 'success'}}
        amount={usd(deposit.held ?? lease.deposit)}
        amountSize={34}
        sub={`Condition at move-in: ${deposit.condition ?? '—'}${
          deposit.moveInLogged ? ' · checklist logged' : ''
        }`}
      />

      {/* Return tracker */}
      <View className="mt-5">
        <SectionLabel
          right={
            <Text className="text-text_muted font-inter text-xs">
              {ret.status === 'HELD' ? 'starts when you give notice' : 'in progress'}
            </Text>
          }>
          Your deposit return
        </SectionLabel>
        <Card>
          <Timeline steps={steps} />

          {ret.status !== 'HELD' && (
            <>
              <Divider style={{marginVertical: 12}} />
              {fmtDate(ret.moveOutDate) && (
                <Row label="Move-out date" value={fmtDate(ret.moveOutDate)} />
              )}
              {fmtDate(ret.expectedBy) && (
                <Row label="Refund expected by" value={fmtDate(ret.expectedBy)} />
              )}
              <Row
                label="Projected refund"
                value={usd((ret.amount ?? deposit.held ?? 0) - (ret.deductions ?? 0))}
                bold
              />
            </>
          )}
        </Card>
      </View>

      {/* Reassurance — copy kept verbatim (do-not-lose) */}
      <View className="mt-4">
        <Card>
          <View className="flex-row items-center gap-3">
            <IconChip>
              <Icon name="shield" size={19} color={COLORS.keystone_gold} />
            </IconChip>
            <Text className="text-keystone_navy font-inter-semibold text-sm flex-1">
              Get more of it back
            </Text>
          </View>
          <Divider style={{marginVertical: 12}} />
          <Text className="text-text_muted font-inter text-xs leading-5">
            Your photo checklist from move-in is your proof of condition. Keep
            it complete, report repairs through the app, and your move-out is
            compared against the baseline — so deductions are fair and your
            refund is faster.
          </Text>
        </Card>
      </View>
    </Screen>
  );
};

export default Deposit;
