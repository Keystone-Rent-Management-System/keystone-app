import React, {useState} from 'react';
import {
  SafeAreaView,
  Share,
  StatusBar,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {KSTile, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';
import {mockInvite} from '../../services/mocks';

// Tenant claim — landing + code merged into one screen (design 8c).
// The code field IS the primary action, so the extra hop disappears;
// the deep link (?code=…) prefills it. Third value prop added: the
// roommates differentiator, previously unsold at the front door. Code
// field styled as a code (22px, tracked, tabular); raster logo → flat
// vector tile; "Ask my landlord" demoted to a link — it's the
// fallback, not a co-equal door.

const ValueRow = ({icon, title, sub}) => (
  <View className="flex-row items-center mb-3.5">
    <IconChip size={40} onDark>
      <Icon name={icon} size={18} color={COLORS.keystone_gold} />
    </IconChip>
    <View className="flex-1 ml-3">
      <Text className="text-white font-inter-semibold" style={{fontSize: 15}}>
        {title}
      </Text>
      <Text className="font-inter text-xs mt-0.5" style={{color: 'rgba(231,229,218,0.72)'}}>
        {sub}
      </Text>
    </View>
  </View>
);

const SHARE_MESSAGE =
  "Hi! I'd love to pay my rent through Keystone — it's free for me, helps build " +
  'my credit, and pays you instantly and directly to your bank. Could you set me ' +
  'up as a tenant? Here’s how it works for landlords: ' +
  'https://dev.keystonerent.app';

const ClaimLanding = () => {
  const nav = useNavigation();
  const route = useRoute();
  const initialInvite = route.params?.invite ?? null;

  const [invite, setInvite] = useState(initialInvite);
  // Deep link /app/claim?code=… prefills the field.
  const [code, setCode] = useState(route.params?.code ?? '');

  const resolveCode = () => {
    if (code.trim().length < 3) {
      ToastAndroid.show('Enter the code from your landlord', ToastAndroid.SHORT);
      return;
    }
    // GET /tenants/claim?token=<code> → invite. Mock resolves any code.
    setInvite(mockInvite);
  };

  const askLandlord = async () => {
    try {
      await Share.share({message: SHARE_MESSAGE});
    } catch (e) {
      // user dismissed the share sheet
    }
  };

  return (
    <View className="flex-1 bg-keystone_navy">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.keystone_navy} />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-10 pb-6 justify-between">
          <View>
            <KSTile
              size={56}
              onDark
              style={{alignSelf: 'flex-start', marginBottom: 40}}
            />

            {invite ? (
              /* ── Resolved invite ───────────────────────────────── */
              <View>
                <Text className="text-keystone_gold font-inter-semibold text-sm uppercase tracking-widest">
                  You’re invited
                </Text>
                <Text className="text-white font-inter-bold text-3xl leading-tight mt-3">
                  Welcome home,{'\n'}
                  {(invite.tenantName || '').split(' ')[0] || 'there'}.
                </Text>
                <View className="bg-white/10 rounded-2xl p-4 mt-6">
                  <Text className="text-white font-inter-bold text-lg">
                    {invite.property}
                    {invite.unit ? ` · ${invite.unit}` : ''}
                  </Text>
                  {invite.address ? (
                    <Text
                      className="font-inter text-sm mt-1"
                      style={{color: 'rgba(231,229,218,0.72)'}}>
                      {invite.address}
                    </Text>
                  ) : null}
                  <View className="h-px bg-white/10 my-3" />
                  <Text className="font-inter text-xs" style={{color: 'rgba(231,229,218,0.72)'}}>
                    Invited by {invite.landlord}
                  </Text>
                </View>
                <Text
                  className="font-inter text-sm mt-5 leading-relaxed"
                  style={{color: 'rgba(231,229,218,0.72)'}}>
                  Set up your account to review your lease, pay rent in two
                  taps, and start building credit.
                </Text>
              </View>
            ) : (
              /* ── Landing + code, one screen (8c) ───────────────── */
              <View>
                <Text className="text-keystone_gold font-inter-semibold text-xs uppercase tracking-widest mb-3">
                  For renters
                </Text>
                <Text
                  className="text-white font-inter-bold text-4xl leading-tight"
                  style={{letterSpacing: -0.5}}>
                  Pay rent.{'\n'}
                  <Text className="text-keystone_gold">Build credit.</Text>
                </Text>

                <View className="mt-7">
                  <ValueRow
                    icon="card"
                    title="Pay in two taps"
                    sub="Instant — and free to you."
                  />
                  <ValueRow
                    icon="trending"
                    title="Build credit with rent"
                    sub="Every on-time payment counts."
                  />
                  <ValueRow
                    icon="shield"
                    title="Your lease is yours alone"
                    sub="Own share, own credit — never joint."
                  />
                </View>

                {/* Code field — the primary action */}
                <Text
                  className="font-inter text-xs mb-2 mt-6 ml-1"
                  style={{color: 'rgba(231,229,218,0.72)'}}>
                  Invite code from your landlord
                </Text>
                <TextInput
                  value={code}
                  onChangeText={t => setCode(t.toUpperCase())}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="KS-4B2A"
                  placeholderTextColor="rgba(231,229,218,0.35)"
                  className="bg-white/10 text-white font-inter-bold rounded-xl px-4 py-3.5"
                  style={{
                    fontSize: 22,
                    letterSpacing: 3,
                    fontVariant: ['tabular-nums'],
                  }}
                />
              </View>
            )}
          </View>

          {/* Actions */}
          <View>
            {invite ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => nav.navigate('auth__login')}
                  className="bg-keystone_cream rounded-2xl py-4 items-center">
                  <Text className="text-keystone_navy font-inter-bold text-base">
                    Set up my account
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setInvite(null)}
                  className="mt-4 items-center">
                  <Text className="font-inter text-sm" style={{color: 'rgba(231,229,218,0.72)'}}>
                    Not you?
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={resolveCode}
                  disabled={code.trim().length < 3}
                  style={{opacity: code.trim().length < 3 ? 0.5 : 1}}
                  className="bg-keystone_cream rounded-2xl py-4 items-center">
                  <Text className="text-keystone_navy font-inter-bold text-base">
                    Claim my home
                  </Text>
                </TouchableOpacity>
                {/* Fallback demoted to a link (8c) */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={askLandlord}
                  className="mt-4 items-center">
                  <Text className="font-inter text-sm" style={{color: 'rgba(231,229,218,0.72)'}}>
                    No code?{' '}
                    <Text className="text-keystone_cream font-inter-semibold underline">
                      Ask my landlord to add me
                    </Text>
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => nav.navigate('auth__login')}
                  className="mt-4 items-center">
                  <Text className="font-inter text-sm" style={{color: 'rgba(231,229,218,0.72)'}}>
                    Already set up?{' '}
                    <Text className="text-keystone_cream font-inter-semibold underline">
                      Sign in
                    </Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ClaimLanding;
