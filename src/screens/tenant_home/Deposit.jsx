import React from 'react';
import {ScrollView, StatusBar, Text, View} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, Label, Divider, Row, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Security deposit — the renter's biggest "will I get it back?" worry.
// Show what's held, the move-in condition baseline, the refund clock, and a
// step-by-step return tracker that goes live once they give notice to vacate.

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

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView contentContainerStyle={{paddingBottom: 28}} showsVerticalScrollIndicator={false}>
        {/* Held */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>Security deposit held</Label>
            <Text className="text-white font-inter-bold text-3xl mt-2" style={{letterSpacing: -0.5}}>
              {usd(deposit.held ?? lease.deposit)}
            </Text>
            <Text className="text-white/55 font-inter text-xs mt-1">
              Held safely · returned after you move out
            </Text>
          </Card>
        </View>

        {/* How it works */}
        <View className="px-4 mt-4">
          <Card>
            <Row label="Condition at move-in" value={deposit.condition ?? '—'} />
            <Divider />
            <Row
              label="Move-in checklist"
              value={deposit.moveInLogged ? 'Logged' : 'Not started'}
              valueColor={deposit.moveInLogged ? COLORS.c_success : COLORS.c_pending}
            />
            <Divider />
            <Row label="Refund window" value={`${deposit.refundDays ?? 14} days after move-out`} />
          </Card>
        </View>

        {/* Return tracker */}
        <View className="px-4 mt-4">
          <View className="flex-row items-center justify-between mb-3 ml-1">
            <Label>Your deposit return</Label>
            {ret.status === 'HELD' ? (
              <Text className="text-text_muted font-inter text-xs">starts when you give notice</Text>
            ) : (
              <Text className="text-gold_text font-inter-semibold text-xs">in progress</Text>
            )}
          </View>
          <Card>
            {RETURN_STEPS.map((step, i) => {
              const done = i < activeIdx;
              const active = i === activeIdx;
              const last = i === RETURN_STEPS.length - 1;
              const dot = done ? COLORS.c_success : active ? COLORS.keystone_gold : '#CBD2D9';
              return (
                <View key={step.key} className="flex-row">
                  {/* rail */}
                  <View className="items-center mr-3" style={{width: 22}}>
                    <View
                      className="rounded-full items-center justify-center"
                      style={{width: 22, height: 22, backgroundColor: dot}}>
                      {done && <Text className="text-white" style={{fontSize: 11}}>✓</Text>}
                    </View>
                    {!last && (
                      <View style={{width: 2, flex: 1, minHeight: 22, backgroundColor: done ? COLORS.c_success : '#E6E2D8'}} />
                    )}
                  </View>
                  {/* label */}
                  <View className={last ? '' : 'pb-4'} style={{flex: 1}}>
                    <Text
                      className={`font-inter-semibold text-sm ${active || done ? 'text-keystone_navy' : 'text-text_muted'}`}>
                      {step.label}
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">{step.sub}</Text>
                  </View>
                </View>
              );
            })}

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

        {/* Reassurance */}
        <View className="px-4 mt-4">
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
      </ScrollView>
    </View>
  );
};

export default Deposit;
