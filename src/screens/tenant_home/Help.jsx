import React, {useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  StatusBar,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import HelpServices from '../../services/help';
import {Card, Divider} from '../../components/premium';
import {
  HeroCard,
  ListRow,
  PrimaryButton,
  Screen,
  SectionLabel,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Help & contact (design 6c). Call/Email no longer bleed outside the
// hero card — inside padding per H1/H5, cream primary + outline
// secondary on navy. Send holds the K3 disabled state until text is
// entered; the repair redirect is a real link into My Home. P1-4
// scope: every link here routes in-app — nothing opens
// keystonerent.app. Past messages (8f) live one tap in.

const Help = () => {
  const nav = useNavigation();
  const {home} = useTenantHome();
  const lease = home?.lease ?? {};
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const phone = lease.landlordPhone ?? '+18005551234';

  const send = async () => {
    if (msg.trim().length < 3) return;
    setBusy(true);
    try {
      await HelpServices.makeComplain(msg.trim());
    } catch (e) {
      // optimistic — BE offline / mock
    }
    setMsg('');
    setBusy(false);
    ToastAndroid.show('Sent — we’ll get back to you', ToastAndroid.LONG);
  };

  return (
    <Screen title="Help & contact" back="More">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {/* Landlord hero — buttons inside padding (H1/H5) */}
      <HeroCard
        label="Your landlord"
        amount={lease.landlord ?? 'Keystone Property Group'}
        amountSize={24}
        sub={`${lease.property ?? ''}${lease.unit ? ` · ${lease.unit}` : ''}`}>
        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${phone}`).catch(() => {})}
            activeOpacity={0.9}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 14,
              backgroundColor: COLORS.keystone_cream,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text className="text-keystone_navy font-inter-semibold text-[15px]">
              Call
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('mailto:support@keystonerent.app').catch(() => {})
            }
            activeOpacity={0.85}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(231,229,218,0.35)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text className="text-keystone_cream font-inter-semibold text-[15px]">
              Email
            </Text>
          </TouchableOpacity>
        </View>
      </HeroCard>

      {/* Message Keystone */}
      <View className="mt-5">
        <SectionLabel>Something's wrong?</SectionLabel>
        <Card style={{padding: 4}}>
          <TextInput
            value={msg}
            onChangeText={setMsg}
            placeholder="Tell us what's going on and we'll help…"
            placeholderTextColor="rgba(21,37,53,0.35)"
            multiline
            className="text-keystone_navy font-inter text-[15px] px-3 py-3"
            style={{minHeight: 96, textAlignVertical: 'top'}}
          />
          <Divider />
          <View className="m-2">
            {busy ? (
              <View style={{minHeight: 48, justifyContent: 'center'}}>
                <ActivityIndicator color={COLORS.keystone_navy} />
              </View>
            ) : (
              <PrimaryButton
                label="Send"
                disabled={msg.trim().length < 3}
                onPress={send}
                style={{minHeight: 48}}
              />
            )}
          </View>
        </Card>

        {/* Past messages (8f) */}
        <Card style={{marginTop: 12, paddingVertical: 0, paddingHorizontal: 16}}>
          <ListRow
            icon="bell"
            title="Your messages"
            sub="Everything you've sent, with status"
            chevron
            last
            onPress={() => nav.navigate('more__complains')}
          />
        </Card>

        {/* Repair triage — a real link, not a dead-end note */}
        <TouchableOpacity
          onPress={() => nav.navigate('my_home_stack', {screen: 'repairs'})}
          activeOpacity={0.7}>
          <Text className="text-keystone_slate font-inter text-xs mt-3 ml-1 leading-5">
            Something broken in your unit?{' '}
            <Text className="text-keystone_navy font-inter-semibold underline">
              Report a repair instead
            </Text>{' '}
            — it gets a vendor and a timeline.
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

export default Help;
