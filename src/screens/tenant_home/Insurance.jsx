import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import DatePicker from 'react-native-date-picker';

import {useTenantInsurance} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, Label, Divider, Row, StatusPill, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Renters insurance — often lease-required, and a natural cross-sell next
// to the landlord's rent insurance. Show coverage, offer to get covered, AND
// let a tenant who's insured elsewhere upload proof of their existing policy —
// which feeds the landlord's compliance record (most leases require it).

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
};

const Insurance = () => {
  const {insurance, isPending, isRefetching, refetch} = useTenantInsurance();
  const covered = insurance?.status === 'COVERED';
  const proof = insurance?.proof ?? {status: 'NONE'};

  // Proof-of-policy upload (an outside policy the tenant already holds).
  const [onFile, setOnFile] = useState(proof.status && proof.status !== 'NONE');
  const [verified] = useState(proof.status === 'VERIFIED');
  const [showForm, setShowForm] = useState(false);
  const [carrier, setCarrier] = useState('');
  const [policyNo, setPolicyNo] = useState('');
  const [liability, setLiability] = useState('');
  const [expiry, setExpiry] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(false);

  const pickDoc = async () => {
    const res = await launchImageLibrary({mediaType: 'photo', quality: 0.7});
    const asset = res?.assets?.[0];
    if (asset?.uri) setDoc(asset);
  };

  const canSubmit = carrier.trim() && policyNo.trim() && doc;

  const submitProof = async () => {
    if (!canSubmit) return;
    setBusy(true);
    // POST /tenants/insurance/proof (multipart: carrier, policyNumber,
    // liability, expiresOn, document). Optimistic — confirm against BE/mock.
    try {
      // wired when BE ships §T11 proof endpoint
    } catch (e) {
      // offline / mock
    }
    setBusy(false);
    setShowForm(false);
    setOnFile(true);
    ToastAndroid.show('Proof submitted — pending verification', ToastAndroid.LONG);
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
        {/* Status hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <View className="flex-row items-center justify-between">
              <Label onDark>Renters insurance</Label>
              <StatusPill
                label={covered ? 'Covered' : 'Not covered'}
                tone={covered ? 'success' : 'danger'}
              />
            </View>
            <Text className="text-white font-inter-bold text-2xl mt-3">
              {covered ? insurance?.provider : 'Protect your stuff'}
            </Text>
            <Text className="text-white/55 font-inter text-xs mt-1">
              {covered
                ? `Policy ${insurance?.policyNumber} · renews ${fmtDate(insurance?.renewsOn)}`
                : 'Coverage from $14/mo — and it satisfies your lease.'}
            </Text>
          </Card>
        </View>

        {covered ? (
          <View className="px-4 mt-4">
            <Card>
              <Row label="Personal property" value={usd(insurance?.personalProperty)} />
              <Divider />
              <Row label="Liability" value={usd(insurance?.liability)} />
              <Divider />
              <Row label="Deductible" value={usd(insurance?.deductible)} />
              <Divider />
              <Row label="Premium" value={`${usd(insurance?.monthlyPremium)}/mo`} />
            </Card>
            <TouchableOpacity
              onPress={() => ToastAndroid.show('File a claim — coming soon', ToastAndroid.SHORT)}
              activeOpacity={0.85}
              className="mt-4 border border-keystone_navy rounded-2xl py-4 items-center">
              <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wider">
                File a claim
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-4 mt-4">
            <Card>
              <View className="flex-row items-center gap-3">
                <IconChip>
                  <Icon name="shield" size={19} color={COLORS.keystone_gold} />
                </IconChip>
                <Text className="text-keystone_navy font-inter-semibold text-sm flex-1">
                  What it covers
                </Text>
              </View>
              <Divider style={{marginVertical: 12}} />
              {['Your belongings if they’re stolen or damaged', 'Liability if someone’s hurt in your unit', 'Temporary housing if your place is unlivable'].map(t => (
                <View key={t} className="flex-row items-start py-1.5">
                  <Text className="text-c_success font-inter-semibold mr-2">✓</Text>
                  <Text className="text-keystone_navy font-inter text-sm flex-1">{t}</Text>
                </View>
              ))}
            </Card>
            <TouchableOpacity
              onPress={() => ToastAndroid.show('Get covered — coming soon', ToastAndroid.SHORT)}
              activeOpacity={0.9}
              className="mt-4 bg-keystone_navy rounded-2xl py-4 items-center">
              <Text className="text-white font-inter-bold text-base">Get covered — $14/mo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Proof of an outside policy — feeds the landlord's lease-compliance */}
        <View className="px-4 mt-6">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Insured elsewhere?
          </Text>

          {onFile ? (
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <IconChip>
                    <Icon name="reports" size={18} color={COLORS.keystone_gold} />
                  </IconChip>
                  <View className="flex-1">
                    <Text className="text-keystone_navy font-inter-semibold text-sm">
                      Proof of insurance on file
                    </Text>
                    <Text className="text-text_muted font-inter text-xs mt-0.5">
                      {carrier || proof.carrier || 'Your policy'} shared with your landlord
                    </Text>
                  </View>
                </View>
                <StatusPill
                  label={verified ? 'Verified' : 'Pending'}
                  tone={verified ? 'success' : 'pending'}
                />
              </View>
            </Card>
          ) : !showForm ? (
            <Card>
              <Text className="text-text_muted font-inter text-xs leading-5 mb-3">
                Your lease may require proof of renters insurance. Already have a
                policy? Add it here and we’ll share it with your landlord.
              </Text>
              <TouchableOpacity
                onPress={() => setShowForm(true)}
                activeOpacity={0.9}
                className="bg-keystone_navy rounded-2xl py-3.5 items-center">
                <Text className="text-white font-inter-semibold text-sm">
                  Add proof of insurance
                </Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <Card>
              <Field label="Insurance carrier">
                <TextInput
                  value={carrier}
                  onChangeText={setCarrier}
                  placeholder="e.g. State Farm"
                  placeholderTextColor={COLORS.inactive_text}
                  className="text-keystone_navy font-inter text-sm px-3 py-2.5"
                />
              </Field>
              <Field label="Policy number">
                <TextInput
                  value={policyNo}
                  onChangeText={setPolicyNo}
                  placeholder="e.g. SF-92841"
                  placeholderTextColor={COLORS.inactive_text}
                  className="text-keystone_navy font-inter text-sm px-3 py-2.5"
                />
              </Field>
              <Field label="Liability coverage (optional)">
                <TextInput
                  value={liability}
                  onChangeText={setLiability}
                  keyboardType="number-pad"
                  placeholder="e.g. 100000"
                  placeholderTextColor={COLORS.inactive_text}
                  className="text-keystone_navy font-inter text-sm px-3 py-2.5"
                />
              </Field>
              <Field label="Expires (optional)">
                <TouchableOpacity onPress={() => setDateOpen(true)} className="px-3 py-2.5">
                  <Text className={`font-inter text-sm ${expiry ? 'text-keystone_navy' : 'text-text_muted'}`}>
                    {expiry ? fmtDate(expiry.toISOString()) : 'Select a date'}
                  </Text>
                </TouchableOpacity>
              </Field>

              {/* Document */}
              {doc?.uri ? (
                <View className="mt-1">
                  <Image source={{uri: doc.uri}} style={{width: '100%', height: 150, borderRadius: 12}} />
                  <TouchableOpacity onPress={() => setDoc(null)} className="mt-1">
                    <Text className="text-c_danger font-inter-medium text-xs text-right">Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={pickDoc}
                  activeOpacity={0.85}
                  className="mt-1 rounded-xl py-4 items-center"
                  style={{borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.keystone_gold}}>
                  <Text className="text-keystone_navy font-inter-semibold text-sm">
                    Upload policy document
                  </Text>
                  <Text className="text-text_muted font-inter text-xs mt-0.5">
                    A photo or scan of your declarations page
                  </Text>
                </TouchableOpacity>
              )}

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => setShowForm(false)}
                  activeOpacity={0.85}
                  className="flex-1 border border-keystone_navy rounded-2xl py-3.5 items-center">
                  <Text className="text-keystone_navy font-inter-semibold text-sm">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={submitProof}
                  disabled={!canSubmit || busy}
                  activeOpacity={0.9}
                  style={{opacity: canSubmit && !busy ? 1 : 0.5}}
                  className="flex-1 bg-keystone_navy rounded-2xl py-3.5 items-center">
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-inter-semibold text-sm">Submit proof</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </View>

        {isPending && (
          <Text className="text-text_muted font-inter text-sm ml-5 mt-4">Loading…</Text>
        )}
      </ScrollView>

      <DatePicker
        modal
        mode="date"
        open={dateOpen}
        date={expiry ?? new Date()}
        onConfirm={d => {
          setDateOpen(false);
          setExpiry(d);
        }}
        onCancel={() => setDateOpen(false)}
      />
    </View>
  );
};

const Field = ({label, children}) => (
  <View className="mb-2">
    <Text className="text-text_muted font-inter-medium text-xs ml-1 mb-1">{label}</Text>
    <View className="bg-white border border-keystone_hairline rounded-xl">{children}</View>
  </View>
);

export default Insurance;
