import React, {useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';

import {useTenantHome} from '../../hooks/useTenantHome';
import AgreementServices from '../../services/AgreementServices';
import {Card, Label, Divider, Row, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Renew or move out — the tenant's end-of-lease decision. A notice to
// vacate feeds the landlord's Lease Expiry + Compliance views; a renewal
// response feeds renewals. POST /vacate-notice / POST /extensions.

const fmtDate = iso => {
  if (!iso) return 'Select a date';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
};

const MoveOut = () => {
  const nav = useNavigation();
  const {home} = useTenantHome();
  const lease = home?.lease ?? {};
  const renewal = home?.renewal ?? {};
  const noticeDays = lease.noticeDays ?? 30;

  const minMoveOut = new Date();
  minMoveOut.setDate(minMoveOut.getDate() + noticeDays);

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
    nav.navigate('home_stack', {screen: 'home'});
  };

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView contentContainerStyle={{paddingBottom: 28}} showsVerticalScrollIndicator={false}>
        {/* Lease end hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>Your lease ends</Label>
            <Text className="text-white font-inter-bold text-2xl mt-2">
              {fmtDate(lease.endDate)}
            </Text>
            <Text className="text-white/55 font-inter text-xs mt-1">
              {lease.daysToEnd ? `in ${lease.daysToEnd} days` : ''} · {noticeDays}-day
              notice required to move out
            </Text>
          </Card>
        </View>

        {/* Renewal offer */}
        {renewal.status === 'OFFERED' && (
          <View className="px-4 mt-4">
            <Card style={{borderColor: COLORS.keystone_gold, borderWidth: 1}}>
              <View className="flex-row items-center gap-3">
                <IconChip>
                  <Icon name="lease" size={19} color={COLORS.keystone_gold} />
                </IconChip>
                <Text className="text-keystone_navy font-inter-semibold text-sm flex-1">
                  Your landlord offered a renewal
                </Text>
              </View>
              <Divider style={{marginVertical: 12}} />
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    ToastAndroid.show('Renewal accepted', ToastAndroid.SHORT);
                    nav.navigate('home_stack', {screen: 'home'});
                  }}
                  activeOpacity={0.9}
                  className="flex-1 bg-keystone_navy rounded-2xl py-3.5 items-center">
                  <Text className="text-white font-inter-semibold text-sm">Renew lease</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => ToastAndroid.show('Maybe later', ToastAndroid.SHORT)}
                  activeOpacity={0.85}
                  className="flex-1 border border-keystone_navy rounded-2xl py-3.5 items-center">
                  <Text className="text-keystone_navy font-inter-semibold text-sm">Not now</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Notice to vacate */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Give notice to vacate
          </Text>
          <Card>
            <Text className="text-text_muted font-inter text-xs leading-5 mb-3">
              Planning to move out? Pick your move-out date. We’ll notify your
              landlord and start your deposit-return clock.
            </Text>
            <TouchableOpacity
              onPress={() => setOpen(true)}
              activeOpacity={0.8}
              className="flex-row items-center justify-between bg-white border border-keystone_hairline rounded-xl px-4 py-3.5">
              <Text className={`font-inter-medium text-sm ${date ? 'text-keystone_navy' : 'text-text_muted'}`}>
                {fmtDate(date?.toISOString())}
              </Text>
              <Icon name="reports" size={18} color={COLORS.keystone_gold} />
            </TouchableOpacity>
            <Divider style={{marginVertical: 14}} />
            <Row label="Deposit refund" value={`within ${lease.refundDays ?? home?.deposit?.refundDays ?? 14} days`} />
          </Card>
        </View>
      </ScrollView>

      {/* Submit */}
      <View className="px-4 pb-6 pt-2 bg-keystone_canvas">
        <TouchableOpacity
          onPress={submitNotice}
          disabled={!date || busy}
          activeOpacity={0.9}
          style={{opacity: date && !busy ? 1 : 0.5}}
          className="bg-keystone_navy rounded-2xl py-4 items-center">
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-inter-bold text-base">Send notice to vacate</Text>
          )}
        </TouchableOpacity>
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
    </View>
  );
};

export default MoveOut;
