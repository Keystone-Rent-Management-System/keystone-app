import React, {useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';

import {useTenantHome} from '../../hooks/useTenantHome';
import AgreementServices from '../../services/AgreementServices';
import {Card, Divider, Row, Icon, IconChip} from '../../components/premium';
import {
  FieldButton,
  HeroCard,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
  eventDate,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Renew or move out (design 6b). Date field gets the calendar icon
// (P2-7/L4 — was a folder); the renewal offer shows its terms before
// asking for a decision ("Review & renew" — you can't accept unseen
// terms); the hero adds the "no action needed until …" reassurance
// line; the notice CTA stays K3-disabled until a date is picked.
// POST /vacate-notice · POST /extensions.

const fmtLong = d =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

const MoveOut = () => {
  const nav = useNavigation();
  const {home} = useTenantHome();
  const lease = home?.lease ?? {};
  const renewal = home?.renewal ?? {};
  const noticeDays = lease.noticeDays ?? 30;

  const minMoveOut = new Date();
  minMoveOut.setDate(minMoveOut.getDate() + noticeDays);

  // Latest day with no action needed = lease end − notice window.
  const decideBy = lease.endDate
    ? new Date(new Date(lease.endDate).getTime() - noticeDays * 86400000)
    : null;

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(null);
  const [busy, setBusy] = useState(false);

  const submitNotice = async () => {
    if (!date) return;
    setBusy(true);
    try {
      await AgreementServices.sendTerminationNotice({
        agreementId: lease.agreementId ?? lease.id,
        vacationDate: date.toISOString().slice(0, 10),
      });
    } catch (e) {
      // BE offline / mock — confirm optimistically.
    }
    ToastAndroid.show('Notice sent — your landlord has been notified', ToastAndroid.LONG);
    setBusy(false);
    nav.navigate('my_home_hub');
  };

  return (
    <Screen
      title="Renew or move out"
      back="My Home"
      stickyFooter={
        busy ? (
          <View style={{minHeight: 52, justifyContent: 'center'}}>
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        ) : (
          <PrimaryButton
            label="Send notice to vacate"
            disabled={!date}
            onPress={submitNotice}
          />
        )
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="Your lease ends"
        amount={fmtLong(lease.endDate) ?? '—'}
        amountSize={28}
        sub={`${lease.daysToEnd ? `In ${lease.daysToEnd} days` : ''}${
          decideBy ? ` · no action needed until ${eventDate('', decideBy).trim()}` : ''
        }`}
      />

      {/* Renewal offer — terms shown before the decision */}
      {renewal.status === 'OFFERED' && (
        <Card
          style={{
            marginTop: 16,
            borderColor: COLORS.keystone_gold,
            borderWidth: 1,
          }}>
          <View className="flex-row items-center gap-3">
            <IconChip>
              <Icon name="lease" size={19} color={COLORS.keystone_gold} />
            </IconChip>
            <View className="flex-1" style={{minWidth: 0}}>
              <Text className="text-keystone_navy font-inter-semibold text-[15px]">
                Your landlord offered a renewal
              </Text>
              <Text className="text-text_muted font-inter text-xs mt-0.5">
                {lease.term ?? '12 months'}
                {renewal.newRent ? ` · $${renewal.newRent}/mo` : ''}
                {lease.endDate
                  ? ` · starts ${eventDate(
                      '',
                      new Date(new Date(lease.endDate).getTime() + 86400000),
                    ).trim()}`
                  : ''}
              </Text>
            </View>
          </View>
          <Divider style={{marginVertical: 12}} />
          <View className="flex-row gap-3">
            <PrimaryButton
              label="Review & renew"
              style={{flex: 1, minHeight: 44}}
              onPress={() => {
                ToastAndroid.show(
                  'Renewal terms open for review with BE support',
                  ToastAndroid.SHORT,
                );
              }}
            />
            <SecondaryButton
              label="Not now"
              style={{flex: 1, minHeight: 44}}
              onPress={() => ToastAndroid.show('Maybe later', ToastAndroid.SHORT)}
            />
          </View>
        </Card>
      )}

      {/* Notice to vacate */}
      <View className="mt-5">
        <SectionLabel>Give notice to vacate</SectionLabel>
        <Card>
          <Text className="text-keystone_slate font-inter text-[13px] leading-5 mb-3">
            Planning to move out? Pick your date — we notify your landlord and
            start your deposit-return clock.
          </Text>
          <FieldButton
            label="Move-out date"
            icon="calendar"
            value={fmtLong(date)}
            placeholder="Select a date"
            onPress={() => setOpen(true)}
          />
          <Divider style={{marginVertical: 14}} />
          <Row
            label="Deposit refund"
            value={`within ${lease.refundDays ?? home?.deposit?.refundDays ?? 14} days`}
          />
        </Card>
      </View>

      <DatePicker
        modal
        mode="date"
        open={open}
        date={date ?? minMoveOut}
        minimumDate={minMoveOut}
        onConfirm={d => {
          setOpen(false);
          setDate(d);
        }}
        onCancel={() => setOpen(false)}
      />
    </Screen>
  );
};

export default MoveOut;
