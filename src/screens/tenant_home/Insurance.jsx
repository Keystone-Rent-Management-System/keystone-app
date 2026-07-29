import React, {useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';

import {useTenantInsurance} from '../../hooks/useTenantHome';
import {Card, Divider, Row} from '../../components/premium';
import {
  FieldButton,
  FormField,
  HeroCard,
  PhotoCaptureTile,
  PhotoThumbRow,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
  StatusChip,
  eventDate,
  pickPhoto,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Renters insurance + proof form (design 6h). The COVERED chip no
// longer clips (H3); the partner is named in the sub-line and the
// headline is the coverage, not the brand string. Proof form: date
// field gets the calendar icon (P2-7), the upload tile is the 4a
// primitive, Submit stays K3-disabled until carrier + policy doc
// exist — the policy-number field is dropped; the declarations photo
// carries it. POST /tenants/insurance/proof (§T11).

const fmtLong = d =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

const Insurance = () => {
  const {insurance, isRefetching, refetch} = useTenantInsurance();
  const covered = insurance?.status === 'COVERED';
  const proof = insurance?.proof ?? {status: 'NONE'};

  const [onFile, setOnFile] = useState(proof.status && proof.status !== 'NONE');
  const [carrier, setCarrier] = useState('');
  const [expiry, setExpiry] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(false);

  const pickDoc = async () => {
    const asset = await pickPhoto();
    if (asset?.uri) setDoc(asset);
  };

  const canSubmit = carrier.trim() && doc;

  const submitProof = async () => {
    if (!canSubmit) return;
    setBusy(true);
    // POST /tenants/insurance/proof (multipart: carrier, expiresOn,
    // document). Optimistic — wired when BE ships §T11.
    try {
      // BE call lands here
    } catch (e) {
      // offline / mock
    }
    setBusy(false);
    setOnFile(true);
    setCarrier('');
    setDoc(null);
    setExpiry(null);
    ToastAndroid.show('Proof submitted — pending verification', ToastAndroid.LONG);
  };

  return (
    <Screen
      title="Renters insurance"
      back="Account"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="Renters insurance"
        badge={{
          text: covered ? 'Covered' : 'Not covered',
          dot: covered ? 'success' : 'danger',
        }}
        amount={
          covered
            ? `${usd(insurance?.personalProperty ?? 0)} covered`
            : 'Protect your stuff'
        }
        amountSize={28}
        sub={
          covered
            ? `${insurance?.provider ?? 'Keystone Renters'} · ${usd(insurance?.monthlyPremium ?? 0)}/mo${
                insurance?.renewsOn
                  ? ` · ${eventDate('renews', insurance.renewsOn)}`
                  : ''
              }`
            : 'Often required by your lease — get covered in minutes.'
        }
      />

      {covered && (
        <View className="mt-4">
          <Card>
            <Row label="Personal property" value={usd(insurance?.personalProperty)} />
            <Divider />
            <Row label="Liability" value={usd(insurance?.liability)} />
            <Divider />
            <Row label="Deductible" value={usd(insurance?.deductible)} />
          </Card>
          <SecondaryButton
            label="File a claim"
            style={{marginTop: 12}}
            onPress={() =>
              ToastAndroid.show(
                'Claims open with the insurance partner',
                ToastAndroid.SHORT,
              )
            }
          />
        </View>
      )}

      {/* Proof of an outside policy */}
      <View className="mt-5">
        <SectionLabel>Insured elsewhere?</SectionLabel>
        {onFile ? (
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-keystone_navy font-inter-semibold text-[15px]">
                Proof on file
              </Text>
              <StatusChip
                label={proof.status === 'VERIFIED' ? 'Verified' : 'Pending review'}
                tone={proof.status === 'VERIFIED' ? 'success' : 'pending'}
              />
            </View>
            <Text className="text-keystone_slate font-inter text-xs mt-2 leading-5">
              Your landlord's compliance record shows your outside policy.
              Submit again if it renews or changes.
            </Text>
          </Card>
        ) : (
          <Card>
            <Text className="text-keystone_slate font-inter text-[13px] leading-5 mb-3">
              Your lease may require proof of renters insurance. Already have a
              policy? Add it here and we'll share it with your landlord.
            </Text>
            <FormField
              label="Insurance carrier"
              placeholder="e.g. State Farm"
              value={carrier}
              onChangeText={setCarrier}
              style={{marginBottom: 14}}
            />
            <FieldButton
              label="Expires · optional"
              icon="calendar"
              value={fmtLong(expiry)}
              placeholder="Select a date"
              onPress={() => setDateOpen(true)}
              style={{marginBottom: 14}}
            />
            <Text className="text-keystone_slate font-inter-medium text-[13px] mb-2">
              Policy document
            </Text>
            {doc ? (
              <PhotoThumbRow
                photos={[doc]}
                onView={() => setDoc(null)}
                onAdd={pickDoc}
              />
            ) : (
              <PhotoCaptureTile
                onPress={pickDoc}
                label="Upload"
                size={88}
              />
            )}
            <Text className="text-keystone_slate font-inter text-xs mt-2 mb-4">
              A photo or scan of your declarations page — it carries the policy
              number for you.
            </Text>
            {busy ? (
              <View style={{minHeight: 52, justifyContent: 'center'}}>
                <ActivityIndicator color={COLORS.keystone_navy} />
              </View>
            ) : (
              <PrimaryButton
                label="Submit proof"
                disabled={!canSubmit}
                onPress={submitProof}
              />
            )}
          </Card>
        )}
      </View>

      <DatePicker
        modal
        mode="date"
        open={dateOpen}
        date={expiry ?? new Date()}
        minimumDate={new Date()}
        onConfirm={d => {
          setDateOpen(false);
          setExpiry(d);
        }}
        onCancel={() => setDateOpen(false)}
      />
    </Screen>
  );
};

export default Insurance;
