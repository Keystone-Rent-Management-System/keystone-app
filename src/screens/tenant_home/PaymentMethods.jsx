import React, {useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {
  Card,
  Label,
  Divider,
  Icon,
  IconChip,
  StatusPill,
  DraftBadge,
  ConsentRow,
  LegalLink,
} from '../../components/premium';
import COLORS from '../../constants/Theme';
import {DWOLLA} from '../../constants/legalCopy';

// Payment methods — the banks/cards rent can come from. Adding one creates a
// Dwolla funding source (white-label), so the tenant must accept the Dwolla
// Terms of Service + Keystone Payment Terms first. The BE persists the
// acceptance timestamp before the funding source is created.

const PaymentMethods = () => {
  const nav = useNavigation();
  const {home, isRefetching, refetch} = useTenantHome();
  const methods = home?.paymentMethods ?? [];

  // Dwolla ToS acceptance gate.
  const [showTos, setShowTos] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const proceedAdd = () => {
    if (!agreed) {
      ToastAndroid.show('Please accept the terms to continue', ToastAndroid.SHORT);
      return;
    }
    // ToS accepted (BE stores the timestamp). Next is just-in-time identity
    // verification (KYC/CIP) before the Dwolla funding source + Plaid bank-link.
    setShowTos(false);
    setAgreed(false);
    nav.navigate('kyc_verify');
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
        <View className="px-5 pt-6 pb-2">
          <Text className="text-keystone_navy font-inter-bold text-2xl">
            Payment methods
          </Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Bank transfers are instant and free. Add a backup card if you like.
          </Text>
        </View>

        {methods.length === 0 && (
          <View className="px-4 mt-3">
            <Card>
              <Text className="text-text_muted font-inter text-sm text-center py-2">
                No payment methods yet. Add a bank or card below to pay rent.
              </Text>
            </Card>
          </View>
        )}

        {methods.length > 0 && (
        <View className="px-4 mt-3">
          <Card style={{paddingVertical: 6}}>
            {methods.map((m, i) => (
              <View key={m.id}>
                {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                <View className="flex-row items-center px-3 py-3.5">
                  <IconChip size={40}>
                    <Icon name={m.type === 'bank' ? 'bank' : 'card'} size={18} color={COLORS.keystone_gold} />
                  </IconChip>
                  <View className="flex-1 ml-3">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">
                      {m.name} ••{m.last4}
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      {m.type === 'bank' ? 'Bank account · instant' : 'Debit card'}
                    </Text>
                  </View>
                  {m.isDefault && <StatusPill label="Default" tone="success" />}
                </View>
              </View>
            ))}
          </Card>
        </View>
        )}

        {!showTos && (
          <View className="px-4 mt-4">
            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowTos(true)}>
              <Card style={{padding: 16, borderStyle: 'dashed', borderColor: COLORS.keystone_gold, borderWidth: 1}}>
                <View className="flex-row items-center justify-center gap-2">
                  <Icon name="bank" size={18} color={COLORS.keystone_gold} />
                  <Text className="text-keystone_navy font-inter-semibold text-sm">
                    Add bank or card
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        )}

        {/* Dwolla ToS acceptance — required before creating a funding source */}
        {showTos && (
          <View className="px-4 mt-4">
            <Card style={{borderColor: COLORS.keystone_gold, borderWidth: 1}}>
              <Label>{DWOLLA.tosTitle}</Label>
              <View className="mt-2">
                <DraftBadge />
              </View>
              <Text className="text-text_muted font-inter text-xs leading-5">
                {DWOLLA.tosText}
              </Text>
              <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-2">
                <LegalLink label="Dwolla Terms of Service" url={DWOLLA.dwollaTosUrl} />
                <LegalLink label="Dwolla Privacy Policy" url={DWOLLA.dwollaPrivacyUrl} />
                <LegalLink label="Keystone Payment Terms" url={DWOLLA.keystoneTermsUrl} />
              </View>
              <ConsentRow checked={agreed} onToggle={() => setAgreed(a => !a)}>
                {DWOLLA.tosCheckbox}
              </ConsentRow>
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    setShowTos(false);
                    setAgreed(false);
                  }}
                  activeOpacity={0.85}
                  className="flex-1 border border-keystone_navy rounded-2xl py-3.5 items-center">
                  <Text className="text-keystone_navy font-inter-semibold text-sm">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={proceedAdd}
                  disabled={!agreed}
                  activeOpacity={0.9}
                  style={{opacity: agreed ? 1 : 0.5}}
                  className="flex-1 bg-keystone_navy rounded-2xl py-3.5 items-center">
                  <Text className="text-white font-inter-semibold text-sm">
                    {DWOLLA.continueCta}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PaymentMethods;
