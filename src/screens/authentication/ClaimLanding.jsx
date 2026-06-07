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

import {KeystoneLogo} from '../../components/premium';
import COLORS from '../../constants/Theme';
import {mockInvite} from '../../services/mocks';

// Tenant front door. Keystone is provisioned-only — a landlord adds the tenant
// and an invite (deep-link token) brings them here. Two paths:
//   • Has an invite  → claim it (resolve token → property/landlord → set up).
//   • No invite      → their landlord isn't on Keystone yet, so let them ask
//     the landlord to add them. That "ask your landlord" share is a
//     supply-acquisition loop: a renter who wants Keystone pulls their
//     landlord onto it.

const SHARE_MESSAGE =
  "Hi! I'd love to pay my rent through Keystone — it's free for me, helps build " +
  'my credit, and pays you instantly and directly to your bank. Could you set me ' +
  'up as a tenant? Here’s how it works for landlords: ' +
  'https://keystone.example/landlords';

const ClaimLanding = () => {
  const nav = useNavigation();
  const route = useRoute();
  // A real deep link passes an invite via route params; otherwise start on the
  // chooser. The mock invite stands in for a resolved token in the demo.
  const initialInvite = route.params?.invite ?? null;

  const [invite, setInvite] = useState(initialInvite);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');

  const resolveCode = () => {
    if (code.trim().length < 3) {
      ToastAndroid.show('Enter the code from your landlord', ToastAndroid.SHORT);
      return;
    }
    // GET /tenants/claim?token=<code> → invite. Mock resolves any code.
    setInvite(mockInvite);
    setShowCode(false);
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
            <View className="self-start bg-keystone_cream rounded-2xl px-3 py-2 mb-10">
              <KeystoneLogo height={38} />
            </View>

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
                    <Text className="text-white/60 font-inter text-sm mt-1">
                      {invite.address}
                    </Text>
                  ) : null}
                  <View className="h-px bg-white/10 my-3" />
                  <Text className="text-white/60 font-inter text-xs">
                    Invited by {invite.landlord}
                  </Text>
                </View>
                <Text className="text-white/60 font-inter text-sm mt-5 leading-relaxed">
                  Set up your account to review your lease, pay rent in two taps,
                  and start building credit.
                </Text>
              </View>
            ) : (
              /* ── No invite yet ─────────────────────────────────── */
              <View>
                <Text className="text-white font-inter-bold text-3xl leading-tight">
                  Pay rent.{'\n'}
                  <Text className="text-keystone_gold">Build credit.</Text>
                </Text>
                <Text className="text-white/70 font-inter text-base mt-4 leading-relaxed">
                  Keystone is set up by your landlord. If you have an invite,
                  claim it below. If they’re not on Keystone yet — ask them.
                </Text>

                {showCode && (
                  <View className="mt-6">
                    <Text className="text-white/60 font-inter text-xs mb-2 ml-1">
                      Invite code
                    </Text>
                    <TextInput
                      value={code}
                      onChangeText={setCode}
                      autoCapitalize="characters"
                      placeholder="e.g. KS-4B2A"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      className="bg-white/10 text-white font-inter text-base rounded-xl px-4 py-3"
                    />
                  </View>
                )}
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
                  className="bg-keystone_gold rounded-2xl py-4 items-center">
                  <Text className="text-keystone_navy font-inter-bold text-base">
                    Set up my account
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setInvite(null)}
                  className="mt-4 items-center">
                  <Text className="text-white/55 font-inter text-sm">Not you?</Text>
                </TouchableOpacity>
              </>
            ) : showCode ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={resolveCode}
                  className="bg-keystone_gold rounded-2xl py-4 items-center">
                  <Text className="text-keystone_navy font-inter-bold text-base">Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowCode(false)}
                  className="mt-4 items-center">
                  <Text className="text-white/55 font-inter text-sm">Back</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowCode(true)}
                  className="bg-keystone_gold rounded-2xl py-4 items-center">
                  <Text className="text-keystone_navy font-inter-bold text-base">
                    I have an invite code
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={askLandlord}
                  className="mt-3 border border-white/25 rounded-2xl py-4 items-center">
                  <Text className="text-white font-inter-semibold text-base">
                    Ask my landlord to add me
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => nav.navigate('auth__login')}
                  className="mt-5 items-center">
                  <Text className="text-white/55 font-inter text-sm">
                    Already set up?{' '}
                    <Text className="text-white font-inter-semibold underline">Sign in</Text>
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
