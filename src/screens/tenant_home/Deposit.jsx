import React from 'react';
import {ScrollView, StatusBar, Text, View} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, Label, Divider, Row, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Security deposit — the renter's biggest "will I get it back?" worry.
// Show what's held, the move-in condition baseline, and the refund clock.

const Deposit = () => {
  const {home} = useTenantHome();
  const deposit = home?.deposit ?? {};
  const lease = home?.lease ?? {};

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
