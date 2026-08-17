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
  const {home, error} = useTenantHome();
  const deposit = home?.deposit ?? {};
  const lease = home?.lease ?? {};

  // MISSING DATA IS NOT PROOF THAT MONEY IS HELD.
  //
  // `deposit.return ?? {status: 'HELD'}` defaulted an absent return state
  // to HELD, and the screen then displayed "Security deposit held", a
  // green "Protected" badge and a return timeline. A tenant with no
  // deposit record — or a failed request — was shown their money as
  // safely held by a party that had never confirmed holding it.
  const amount = deposit.held ?? lease.deposit;
  const known = !error && amount != null && deposit.return?.status != null;
  const ret = deposit.return ?? {};
  // findIndex returns -1 for an unknown status, and Math.max(0, -1) made
  // that 0 — so the timeline confidently marked "Held — current" and
  // "in progress" for a deposit whose state nobody knows.
  const foundIdx = RETURN_STEPS.findIndex(s => s.key === ret.status);
  const activeIdx = foundIdx;

  // With an unknown status every step is 'upcoming' — nothing is claimed
  // as done or in progress.
  const steps = RETURN_STEPS.map((step, i) => ({
    title: i === activeIdx ? `${step.label} — current` : step.label,
    sub:
      step.key === 'REFUNDED'
        ? `Sent to your bank within ${deposit.refundDays ?? 14} days`
        : step.sub,
    state:
      activeIdx < 0
        ? 'upcoming'
        : i < activeIdx
          ? 'done'
          : i === activeIdx
            ? 'current'
            : 'upcoming',
  }));

  return (
    <Screen title="Security deposit" back="My Home">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {known ? (
        <HeroCard
          label="Security deposit held"
          badge={{text: 'Protected', dot: 'success'}}
          amount={usd(amount)}
          amountSize={34}
          sub={`Condition at move-in: ${deposit.condition ?? '—'}${
            deposit.moveInLogged ? ' · checklist logged' : ''
          }`}
        />
      ) : (
        <HeroCard
          label="Security deposit"
          amount={amount != null ? usd(amount) : 'Not confirmed'}
          amountSize={amount != null ? 34 : 22}
          sub="Keystone can’t confirm your deposit status. Ask your landlord who holds it and where."
        />
      )}

      {/* Return tracker */}
      <View className="mt-5">
        <SectionLabel
          right={
            <Text className="text-text_muted font-inter text-xs">
              {/* "in progress" was the fallback for an unknown status. */}
              {!known
                ? 'status unknown'
                : ret.status === 'HELD'
                  ? 'starts when you give notice'
                  : 'in progress'}
            </Text>
          }>
          Your deposit return
        </SectionLabel>
        <Card>
          <Timeline steps={steps} />

          {known && ret.status !== 'HELD' && (
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
          {/* Promised a stored baseline, fairer deductions and a faster
              refund. Condition records cannot be stored at all
              (capability `conditionRecords`), so none of it follows. */}
          <Text className="text-text_muted font-inter text-xs leading-5">
            Photos you take at move-in are your own proof of condition — keep
            them somewhere safe. Keystone can’t store them for you yet.
          </Text>
        </Card>
      </View>
    </Screen>
  );
};

export default Deposit;
