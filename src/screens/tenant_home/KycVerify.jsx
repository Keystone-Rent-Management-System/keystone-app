import React, {useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';

import {Card, Label, Icon, IconChip, DraftBadge} from '../../components/premium';
import COLORS from '../../constants/Theme';
import {KYC} from '../../constants/legalCopy';

// JIT KYC / CIP — collected at "Add a payment method", AFTER the Dwolla ToS
// gate and just before a funding source is created (not upfront at claim, so a
// tenant can explore first). Submits to Dwolla customer verification. CEO
// decision: KYC is just-in-time. POST /tenants/kyc — see BE_ASKS §T12.

const fmtDate = iso => {
  if (!iso) return 'Select your date of birth';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
};

const Field = ({label, children}) => (
  <View className="mb-2">
    <Text className="text-text_muted font-inter-medium text-xs ml-1 mb-1">{label}</Text>
    <View className="bg-white border border-keystone_hairline rounded-xl">{children}</View>
  </View>
);

const input = {
  className: 'text-keystone_navy font-inter text-sm px-3 py-2.5',
  placeholderTextColor: COLORS.inactive_text,
};

const KycVerify = () => {
  const nav = useNavigation();
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

  const canSubmit =
    first.trim() && last.trim() && dob && ssn.trim().length === 4 && street.trim() && zip.trim();

  const submit = async () => {
    if (!canSubmit) {
      ToastAndroid.show('Fill in the required fields', ToastAndroid.SHORT);
      return;
    }
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
    // Next step: Plaid bank-link (BE link-token). Stubbed until the SDK + token
    // land; for now return to the methods list.
    nav.navigate('payment_methods');
  };

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView contentContainerStyle={{paddingBottom: 28}} showsVerticalScrollIndicator={false}>
        {/* Why */}
        <View className="px-4 pt-5">
          <Card>
            <View className="flex-row items-center gap-3">
              <IconChip>
                <Icon name="shield" size={19} color={COLORS.keystone_gold} />
              </IconChip>
              <Text className="text-keystone_navy font-inter-semibold text-sm flex-1">
                {KYC.title}
              </Text>
            </View>
            <View className="mt-3">
              <DraftBadge />
            </View>
            <Text className="text-text_muted font-inter text-xs leading-5">
              {KYC.disclosure}
            </Text>
          </Card>
        </View>

        {/* Form */}
        <View className="px-4 mt-4">
          <Label>Legal name</Label>
          <View className="flex-row gap-2 mt-2">
            <View className="flex-1">
              <Field label="First name">
                <TextInput value={first} onChangeText={setFirst} placeholder="Sarah" {...input} />
              </Field>
            </View>
            <View className="flex-1">
              <Field label="Last name">
                <TextInput value={last} onChangeText={setLast} placeholder="Chen" {...input} />
              </Field>
            </View>
          </View>

          <Field label="Date of birth">
            <TouchableOpacity onPress={() => setDobOpen(true)} className="px-3 py-2.5">
              <Text className={`font-inter text-sm ${dob ? 'text-keystone_navy' : 'text-text_muted'}`}>
                {fmtDate(dob?.toISOString())}
              </Text>
            </TouchableOpacity>
          </Field>

          <Field label="SSN (last 4)">
            <TextInput
              value={ssn}
              onChangeText={t => setSsn(t.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              placeholder="1234"
              maxLength={4}
              {...input}
            />
          </Field>

          <Label style={{marginTop: 8}}>Home address</Label>
          <View className="mt-2">
            <Field label="Street">
              <TextInput value={street} onChangeText={setStreet} placeholder="128 Magnolia Ave" {...input} />
            </Field>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Field label="City">
                  <TextInput value={city} onChangeText={setCity} placeholder="Austin" {...input} />
                </Field>
              </View>
              <View style={{width: 88}}>
                <Field label="State">
                  <TextInput
                    value={stateCode}
                    onChangeText={t => setStateCode(t.toUpperCase().slice(0, 2))}
                    placeholder="TX"
                    autoCapitalize="characters"
                    maxLength={2}
                    {...input}
                  />
                </Field>
              </View>
              <View style={{width: 96}}>
                <Field label="ZIP">
                  <TextInput
                    value={zip}
                    onChangeText={t => setZip(t.replace(/[^0-9]/g, '').slice(0, 5))}
                    keyboardType="number-pad"
                    placeholder="78701"
                    maxLength={5}
                    {...input}
                  />
                </Field>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Submit */}
      <View className="px-4 pb-6 pt-2 bg-keystone_canvas">
        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit || busy}
          activeOpacity={0.9}
          style={{opacity: canSubmit && !busy ? 1 : 0.5}}
          className="bg-keystone_navy rounded-2xl py-4 items-center">
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-inter-bold text-base">{KYC.submitCta}</Text>
          )}
        </TouchableOpacity>
      </View>

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
    </View>
  );
};

export default KycVerify;
