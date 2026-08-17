import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Icon} from '../../components/premium';
import {
  ListRow,
  Screen,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {can} from '../../constants/capabilities';

// Payment methods + Dwolla consent (design 5c). Resolves brief P1-6:
// The add-a-method funnel (Dwolla ToS acceptance → KYC → Plaid) is
// removed while none of it exists; see the note at the add tile. What
// remains is a truthful list of methods already on file.

const PaymentMethods = () => {
  const {home, isRefetching, refetch} = useTenantHome();
  const methods = home?.paymentMethods ?? [];



  return (
    <Screen
      title="Payment methods"
      back="Pay"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {/* Said transfers are "instant and free" and told the user to add
          an account "below" — a settlement promise plus an instruction to
          use a control that is disabled. */}
      <Text className="text-keystone_slate font-inter text-[15px] mb-4">
        Accounts you’ve added for rent.
      </Text>

      {methods.length > 0 ? (
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {methods.map((m, i) => (
            <ListRow
              key={m.id}
              icon={m.type === 'bank' ? 'bank' : 'card'}
              title={`${m.name} ••${m.last4}`}
              sub={m.type === 'bank' ? 'Bank account' : 'Debit card · backup'}
              chip={m.isDefault ? {label: 'Default', tone: 'success'} : undefined}
              chevron={!m.isDefault}
              last={i === methods.length - 1}
            />
          ))}
        </Card>
      ) : (
        <Card>
          <Text className="text-text_muted font-inter text-sm text-center py-2">
            No payment methods yet. Add a bank or card below to pay rent.
          </Text>
        </Card>
      )}

      {/* The unavailable gate sits HERE — before consent, not after it.
          This tile opened a funnel that asked the tenant to accept Dwolla's
          terms plus Keystone payment terms that are not published, and then
          collected date of birth, SSN digits and home address on the KYC
          screen, only to end with "this isn't available". Consent and PII
          must never be solicited for a capability that does not exist, so
          the entry point closes rather than the exit. */}
      {(
        <View
          className="mt-4"
          style={{
            borderRadius: 12,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: 'rgba(21,37,53,0.20)',
            paddingVertical: 18,
            paddingHorizontal: 16,
            alignItems: 'center',
            opacity: 0.6,
          }}>
          <View className="flex-row items-center gap-2">
            <Icon name="bank" size={18} color={COLORS.keystone_slate} />
            <Text className="text-keystone_navy font-inter-semibold text-[15px]">
              Add bank or card
            </Text>
          </View>
          <Text className="text-keystone_slate font-inter text-xs leading-5 mt-2 text-center">
            {can('paymentMethods')
              ? 'Add a bank account to pay rent.'
              : 'Connecting a bank isn’t available yet. We’ll ask for your details when it is — not before.'}
          </Text>
        </View>
      )}

      {/* Dwolla ToS acceptance — before creating a funding source */}
      {/* The Dwolla ToS / Keystone-payment-terms consent block and its
          "Continue" into KYC are DELETED, not hidden. With the entry tile
          closed above, `showTos` could never become true — leaving the
          branch in place kept a funnel that asked a tenant to accept terms
          that are not published ("Keystone Payment Terms — published when
          legal review completes") in order to reach an identity check that
          does not exist. Consent UI for an absent capability should not
          survive as dead code waiting to be re-enabled. Restore it with
          the published, versioned documents and a real funding-source
          flow (BE §T12). */}
    </Screen>
  );
};

export default PaymentMethods;
