import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';

import {Card, Icon} from '../../components/premium';
import {
  FieldButton,
  FormField,
  HeroCard,
  PrimaryButton,
  Screen,
  SectionLabel,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {KYC} from '../../constants/legalCopy';

// KYC — verify identity (design 5d). The scariest ask in the app gets
// the most reassurance: why (federal law), scope ("never a credit
// pull"), storage ("Keystone never stores your SSN"), and a photo-ID
// fallback. Numbered progress rows reuse the checklist pattern; one
// field-group per step keeps the keyboard from burying context.
// JIT KYC/CIP: collected AFTER the Dwolla ToS gate, just before the
// funding source. POST /tenants/kyc — BE_ASKS §T12.

const STEPS = [
  {key: 'name', label: 'Legal name & date of birth'},
  {key: 'ssn', label: 'Last 4 of SSN', note: 'Identity check only — never a credit pull'},
  {key: 'address', label: 'Home address'},
];

const fmtDate = d =>
  d
    ? d.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})
    : null;

const KycVerify = () => {
  const nav = useNavigation();
  const [step, setStep] = useState(0);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [dob, setDob] = useState(null);
  const [dobOpen, setDobOpen] = useState(false);
  const [ssn, setSsn] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [zip, setZip] = useState('');
  const [busy, setBusy] = useState(false);

  const stepDone = useMemo(
    () => [
      !!(first.trim() && last.trim() && dob),
      ssn.trim().length === 4,
      !!(street.trim() && city.trim() && stateCode.trim() && zip.trim().length === 5),
    ],
    [first, last, dob, ssn, street, city, stateCode, zip],
  );

  const submit = async () => {
    setBusy(true);
    // POST /tenants/kyc { firstName, lastName, dob, ssnLast4, address }
    // → Dwolla customer verification. Optimistic until BE ships §T12.
    try {
      // wired when BE ships the Dwolla KYC endpoint
    } catch (e) {
      // offline / mock
    }
    setBusy(false);
    ToastAndroid.show('Identity submitted — connecting your bank next', ToastAndroid.LONG);
    nav.navigate('payment_methods');
  };

  const next = () => {
    if (step < 2) setStep(step + 1);
    else submit();
  };

  return (
    <Screen
      title="Verify identity"
      back="Payment methods"
      stickyFooter={
        busy ? (
          <View style={{minHeight: 52, justifyContent: 'center'}}>
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        ) : (
          <PrimaryButton
            label={step < 2 ? 'Continue' : KYC.submitCta}
            disabled={!stepDone[step]}
            onPress={next}
          />
        )
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="One-time check"
        amount="Confirm it's you"
        amountSize={24}
        sub="Federal law requires payment providers to verify identity. Takes about a minute."
      />

      {/* Numbered progress rows */}
      <View className="mt-5">
        <SectionLabel>What we need</SectionLabel>
        <Card style={{paddingVertical: 6}}>
          {STEPS.map((s, i) => {
            const done = stepDone[i];
            const current = i === step;
            return (
              <View
                key={s.key}
                className="flex-row items-center py-2.5"
                style={
                  i < STEPS.length - 1 && {
                    borderBottomWidth: 0.5,
                    borderBottomColor: COLORS.keystone_hairline,
                  }
                }>
                <View
                  className="w-7 h-7 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: done
                      ? 'rgba(5,166,96,0.12)'
                      : current
                        ? COLORS.keystone_navy
                        : 'rgba(21,37,53,0.06)',
                  }}>
                  {done ? (
                    <Text style={{color: '#037147', fontSize: 13}}>✓</Text>
                  ) : (
                    <Text
                      style={{
                        color: current ? COLORS.keystone_cream : COLORS.keystone_slate,
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 13,
                      }}>
                      {i + 1}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-inter-${current || done ? 'semibold' : 'medium'} text-sm`}
                    style={{
                      color: current || done ? COLORS.keystone_navy : 'rgba(21,37,53,0.45)',
                    }}>
                    {s.label}
                  </Text>
                  {s.note && current ? (
                    <Text className="text-keystone_slate font-inter text-xs mt-0.5">
                      {s.note}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </Card>
      </View>

      {/* Step forms — one group at a time */}
      <View className="mt-5">
        {step === 0 && (
          <>
            <FormField
              label="First name"
              placeholder="Sarah"
              autoComplete="given-name"
              value={first}
              onChangeText={setFirst}
              style={{marginBottom: 14}}
            />
            <FormField
              label="Last name"
              placeholder="Chen"
              autoComplete="family-name"
              value={last}
              onChangeText={setLast}
              style={{marginBottom: 14}}
            />
            <FieldButton
              label="Date of birth"
              value={fmtDate(dob)}
              placeholder="Select your date of birth"
              onPress={() => setDobOpen(true)}
            />
          </>
        )}

        {step === 1 && (
          <>
            <FormField
              label="Last 4 of SSN"
              icon="lock"
              placeholder="• • • •"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={ssn}
              onChangeText={t => setSsn(t.replace(/[^0-9]/g, '').slice(0, 4))}
            />
            <Text className="text-keystone_slate font-inter text-xs mt-3 leading-5">
              Encrypted and sent only to Dwolla, our payment processor.
              Keystone never stores your SSN.
            </Text>
          </>
        )}

        {step === 2 && (
          <>
            <FormField
              label="Street"
              placeholder="128 Magnolia Ave"
              autoComplete="street-address"
              value={street}
              onChangeText={setStreet}
              style={{marginBottom: 14}}
            />
            <FormField
              label="City"
              placeholder="Austin"
              value={city}
              onChangeText={setCity}
              style={{marginBottom: 14}}
            />
            <View className="flex-row gap-3">
              <FormField
                label="State"
                placeholder="TX"
                autoCapitalize="characters"
                maxLength={2}
                value={stateCode}
                onChangeText={t => setStateCode(t.toUpperCase().slice(0, 2))}
                style={{flex: 1}}
              />
              <FormField
                label="ZIP"
                placeholder="78701"
                keyboardType="number-pad"
                maxLength={5}
                value={zip}
                onChangeText={t => setZip(t.replace(/[^0-9]/g, '').slice(0, 5))}
                style={{flex: 2}}
              />
            </View>
          </>
        )}
      </View>

      <Text className="text-keystone_slate font-inter text-xs mt-5 leading-5">
        If automatic verification fails, you can photograph your ID instead.
      </Text>

      <DatePicker
        modal
        mode="date"
        open={dobOpen}
        date={dob ?? new Date(2000, 0, 1)}
        maximumDate={new Date()}
        onConfirm={d => {
          setDobOpen(false);
          setDob(d);
        }}
        onCancel={() => setDobOpen(false)}
      />
    </Screen>
  );
};

export default KycVerify;
