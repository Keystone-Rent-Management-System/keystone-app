import React, {useState} from 'react';
import {
  RefreshControl,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {Card, Icon} from '../../components/premium';
import {
  ConsentBlock,
  ListRow,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {DWOLLA} from '../../constants/legalCopy';

// Payment methods + Dwolla consent (design 5c). Resolves brief P1-6:
// the concatenated Dwolla links are "·"-separated (L3, via the kit
// ConsentBlock) and "(soon)" becomes an honest explanation line.
// Agree & continue holds the K3 disabled state until checked; the add
// tile borrows the P1 dashed affordance. Adding a method creates a
// Dwolla funding source, so ToS acceptance (timestamped by the BE)
// precedes KYC + Plaid.

const PaymentMethods = () => {
  const nav = useNavigation();
  const {home, isRefetching, refetch} = useTenantHome();
  const methods = home?.paymentMethods ?? [];

  const [showTos, setShowTos] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const proceedAdd = () => {
    if (!agreed) {
      ToastAndroid.show('Please accept the terms to continue', ToastAndroid.SHORT);
      return;
    }
    setShowTos(false);
    setAgreed(false);
    nav.navigate('kyc_verify');
  };

  const openUrl = url => () =>
    ToastAndroid.show('Opens in-app when legal links publish', ToastAndroid.SHORT);

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

      <Text className="text-keystone_slate font-inter text-[15px] mb-4">
        Bank transfers are instant and free. Add a backup card if you like.
      </Text>

      {methods.length > 0 ? (
        <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
          {methods.map((m, i) => (
            <ListRow
              key={m.id}
              icon={m.type === 'bank' ? 'bank' : 'card'}
              title={`${m.name} ••${m.last4}`}
              sub={m.type === 'bank' ? 'Bank account · instant' : 'Debit card · backup'}
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

      {!showTos && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowTos(true)}
          className="mt-4"
          style={{
            borderRadius: 12,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: 'rgba(21,37,53,0.20)',
            paddingVertical: 18,
            alignItems: 'center',
          }}>
          <View className="flex-row items-center gap-2">
            <Icon name="bank" size={18} color={COLORS.keystone_gold} />
            <Text className="text-keystone_navy font-inter-semibold text-[15px]">
              Add bank or card
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Dwolla ToS acceptance — before creating a funding source */}
      {showTos && (
        <View className="mt-4">
          <SectionLabel>Before you add a payment method</SectionLabel>
          <ConsentBlock
            copy={DWOLLA.tosText}
            links={[
              {label: 'Dwolla Terms of Service', onPress: openUrl(DWOLLA.dwollaTosUrl)},
              {label: 'Dwolla Privacy Policy', onPress: openUrl(DWOLLA.dwollaPrivacyUrl)},
            ]}
            checked={agreed}
            onToggle={() => setAgreed(a => !a)}
            agreeText={DWOLLA.tosCheckbox}>
            <Text className="text-text_muted font-inter text-xs mt-2">
              Keystone Payment Terms — published when legal review completes.
            </Text>
            <View className="flex-row gap-3 mt-4">
              <SecondaryButton
                label="Cancel"
                style={{flex: 1}}
                onPress={() => {
                  setShowTos(false);
                  setAgreed(false);
                }}
              />
              <PrimaryButton
                label={DWOLLA.continueCta}
                style={{flex: 1}}
                disabled={!agreed}
                onPress={proceedAdd}
              />
            </View>
          </ConsentBlock>
        </View>
      )}
    </Screen>
  );
};

export default PaymentMethods;
