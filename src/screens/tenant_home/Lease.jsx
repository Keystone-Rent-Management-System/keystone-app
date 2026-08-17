import React, {useState} from 'react';
import {ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, IconChip, Label, Divider, Row, Icon} from '../../components/premium';
import {PrimaryButton, Screen, SectionLabel, StatusChip} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {toast} from '../../utils/toast';
import {getError} from '../../utils/getError';
import AgreementServices from '../../services/AgreementServices';

// The tenant's lease — everything about where they live, in one calm
// view. When the lease is still PENDING (landlord sent it, tenant hasn't
// signed), this is also where they review and accept it.

const fmtDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
};

const Lease = () => {
  const nav = useNavigation();
  const {home, isPending, refetch} = useTenantHome();
  const [accepting, setAccepting] = useState(false);

  const lease = home?.lease ?? {};
  const isPendingAccept = lease.agreementStatus === 'PENDING';
  const docs = lease.documents ?? [];

  // Accepting a lease is a binding act. This used to be a toast and a
  // 600ms timer with no request at all — the tenant was told "Lease
  // accepted", the agreement stayed PENDING on the server, and neither
  // side had a record. `acceptAgreement` (PATCH /agreements/{id}/
  // acceptance) exists and BE confirms it, so wire it and confirm only
  // on a resolved response.
  const onAccept = async () => {
    const agreementId = lease.agreementId ?? lease.id;
    if (!agreementId) {
      toast.show(
        'We couldn’t find your lease to accept. Please contact your landlord.',
        toast.LONG,
      );
      return;
    }
    setAccepting(true);
    try {
      await AgreementServices.acceptAgreement(agreementId);
    } catch (err) {
      setAccepting(false);
      toast.show(
        `We couldn’t accept your lease — ${getError(err)}. It has not been accepted; please try again.`,
        toast.LONG,
      );
      return;
    }
    await refetch?.();
    setAccepting(false);
    toast.show('Lease accepted — welcome home!', toast.LONG);
    nav.navigate('home');
  };

  if (isPending) {
    return (
      <View className="flex-1 bg-keystone_canvas items-center justify-center">
        <ActivityIndicator color={COLORS.keystone_navy} />
      </View>
    );
  }

  return (
    <Screen
      title="My lease"
      back="My Home"
      stickyFooter={
        isPendingAccept ? (
          accepting ? (
            <View style={{minHeight: 52, justifyContent: 'center'}}>
              <ActivityIndicator color={COLORS.keystone_navy} />
            </View>
          ) : (
            <PrimaryButton label="Accept lease" onPress={onAccept} />
          )
        ) : null
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      {/* Property hero */}
      <View>
          <Card feature>
            <Label onDark>{isPendingAccept ? 'Lease offered' : 'Your home'}</Label>
            <Text className="text-white font-inter-bold text-2xl mt-2">
              {lease.property}
              {lease.unit ? ` · ${lease.unit}` : ''}
            </Text>
            <Text className="text-white/60 font-inter text-sm mt-1">
              {lease.address}
            </Text>
            <View className="mt-3" style={{alignSelf: 'flex-start', maxWidth: '70%'}}>
              <StatusChip
                onDark
                dot
                tone={isPendingAccept ? 'pending' : 'success'}
                label={isPendingAccept ? 'Awaiting your signature' : 'Active lease'}
              />
            </View>
          </Card>
        </View>

        {/* Accept banner */}
        {isPendingAccept && (
          <View className="mt-3">
            <Card style={{padding: 14, borderColor: COLORS.keystone_gold, borderWidth: 1}}>
              <Text className="text-keystone_navy font-inter-semibold text-sm">
                Review and accept your lease
              </Text>
              <Text className="text-text_muted font-inter text-xs mt-1">
                Your landlord sent this lease. Read the terms below, then
                accept to activate your tenancy.
              </Text>
            </Card>
          </View>
        )}

        {/* Terms */}
        <View className="mt-4">
          <SectionLabel>Lease terms</SectionLabel>
          <Card>
            <Row label="Monthly rent" value={usd(lease.monthlyRent)} bold />
            <Divider />
            <Row label="Security deposit" value={usd(lease.deposit)} />
            <Divider />
            <Row label="Term" value={lease.term ?? '—'} />
            <Divider />
            <Row label="Started" value={fmtDate(lease.startDate)} />
            <Divider />
            <Row
              label="Ends"
              value={fmtDate(lease.endDate)}
              sub={lease.daysToEnd ? `in ${lease.daysToEnd} days` : null}
            />
            <Divider />
            <Row label="Managed by" value={lease.landlord ?? '—'} />
          </Card>
        </View>

        {/* Documents */}
        {docs.length > 0 && (
          <View className="mt-5">
            <SectionLabel>Documents</SectionLabel>
            <Card style={{paddingVertical: 6}}>
              {docs.map((d, i) => (
                <View key={d.id}>
                  {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    // Said "Opening document…" and opened nothing.
                    onPress={() =>
                      toast.show(
                        'Lease documents aren’t viewable in the app yet — ask your landlord for a copy.',
                        toast.LONG,
                      )
                    }
                    className="flex-row items-center px-3 py-3">
                    <IconChip size={36}>
                      <Icon
                        name={d.kind === 'Signed' ? 'lease' : 'reports'}
                        size={17}
                        color={COLORS.keystone_gold}
                      />
                    </IconChip>
                    <View className="flex-1 ml-3">
                      <Text className="text-keystone_navy font-inter-semibold text-sm">
                        {d.name}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs mt-0.5">
                        {d.kind} · {fmtDate(d.date)}
                      </Text>
                    </View>
                    <Text className="text-text_muted font-inter-semibold text-base">
                      ›
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          </View>
        )}
    </Screen>
  );
};

export default Lease;
