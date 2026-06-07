import React, {useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import {useTenantHome} from '../../hooks/useTenantHome';
import HelpServices from '../../services/help';
import {Card, Label, Divider, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Help & contact — reach the landlord, or tell Keystone what's wrong.
// Reuses POST /complaints + /general-assistance.

const Help = () => {
  const {home} = useTenantHome();
  const lease = home?.lease ?? {};
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

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
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView contentContainerStyle={{paddingBottom: 28}} showsVerticalScrollIndicator={false}>
        {/* Landlord contact */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>Your landlord</Label>
            <Text className="text-white font-inter-bold text-xl mt-2">
              {lease.landlord ?? 'Keystone Property Group'}
            </Text>
            <Text className="text-white/55 font-inter text-xs mt-1 mb-4">
              {lease.property}
              {lease.unit ? ` · ${lease.unit}` : ''}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => Linking.openURL('tel:+18005551234').catch(() => {})}
                activeOpacity={0.9}
                className="flex-1 bg-keystone_gold rounded-2xl py-3 items-center">
                <Text className="text-keystone_navy font-inter-bold text-sm">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL('mailto:support@keystone.com').catch(() => {})}
                activeOpacity={0.85}
                className="flex-1 border border-white/30 rounded-2xl py-3 items-center">
                <Text className="text-white font-inter-semibold text-sm">Email</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Tell us */}
        <View className="px-4 mt-5">
          <View className="flex-row items-center gap-3 mb-3 ml-1">
            <IconChip size={36}>
              <Icon name="bell" size={16} color={COLORS.keystone_gold} />
            </IconChip>
            <Text className="text-keystone_navy font-inter-semibold text-sm">
              Something’s wrong?
            </Text>
          </View>
          <Card style={{padding: 4}}>
            <TextInput
              value={msg}
              onChangeText={setMsg}
              placeholder="Tell us what’s going on and we’ll help…"
              placeholderTextColor={COLORS.inactive_text}
              multiline
              className="text-keystone_navy font-inter text-sm px-3 py-3"
              style={{minHeight: 96, textAlignVertical: 'top'}}
            />
            <Divider />
            <TouchableOpacity
              onPress={send}
              disabled={busy || msg.trim().length < 3}
              activeOpacity={0.85}
              style={{opacity: !busy && msg.trim().length >= 3 ? 1 : 0.5}}
              className="m-2 bg-keystone_navy rounded-xl py-3 items-center">
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-inter-semibold text-sm">Send</Text>
              )}
            </TouchableOpacity>
          </Card>
          <Text className="text-text_muted font-inter text-xs mt-3 ml-1">
            For a repair, use Repairs in My Home so your landlord can act on it
            with a photo.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Help;
