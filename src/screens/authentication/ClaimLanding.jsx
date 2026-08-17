import React, {useState} from 'react';
import {
  SafeAreaView,
  Share,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {KSTile, Icon, IconChip} from '../../components/premium';
import COLORS from '../../constants/Theme';
import AuthServices from '../../services/AuthServices';
import {getError} from '../../utils/getError';
import {toast} from '../../utils/toast';

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

// Repeated the instant-settlement and credit-building claims to a
// LANDLORD, in a message the renter sends under their own name. Neither
// capability exists, so the renter was made to vouch for them.
const SHARE_MESSAGE =
  'Hi! I’d like to handle my tenancy through Keystone — rent, receipts, ' +
  'repairs and my lease in one place. Could you set me up as a tenant? ' +
  'Here’s how it works for landlords: https://keystonerent.app';

const ClaimLanding = () => {
  const nav = useNavigation();
  const route = useRoute();
  const initialInvite = route.params?.invite ?? null;

  const [invite, setInvite] = useState(initialInvite);
  // Deep link /app/claim?code=… prefills the field.
  const [code, setCode] = useState(route.params?.code ?? '');

  const [resolving, setResolving] = useState(false);

  // GET /tenants/claim?token=<code> (§T16). Live on api-dev and callable
  // unauthenticated, which is what this screen needs — the tenant has no
  // account until the claim completes.
  const resolveCode = async () => {
    const entered = code.trim();
    if (entered.length < 3) {
      toast.show('Enter the code from your landlord', toast.SHORT);
      return;
    }
    setResolving(true);
    try {
      const found = await AuthServices.resolveInvite(entered);
      if (!found) {
        throw new Error('empty invite');
      }
      setInvite(found);
    } catch (err) {
      // 404 is BE's answer for a bad code, and it is by far the likely
      // case here — name it plainly instead of leaking a status.
      const status = err?.response?.status;
      toast.show(
        status === 404
          ? "That code didn't match an invite. Check it with your landlord."
          : `Couldn't check that code — ${getError(err)}`,
        toast.LONG,
      );
    } finally {
      setResolving(false);
    }
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
                  Set up your account to see your lease, your rent and your
                  home in one place.
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
                  Your home,{'\n'}
                  <Text className="text-keystone_gold">in one place.</Text>
                </Text>

                <View className="mt-7">
                  {/* "Pay in two taps · Instant" and "Build credit with
                      rent" both described capabilities that do not exist
                      — on the screen an applicant sees before they have
                      agreed to anything. */}
                  <ValueRow
                    icon="lease"
                    title="Your lease and rent"
                    sub="What you owe, when it’s due, and what you’ve paid."
                  />
                  <ValueRow
                    icon="wrench"
                    title="Repairs and messages"
                    sub="Ask for a fix, and follow what happens next."
                  />
                  <ValueRow
                    icon="shield"
                    title="Your lease is yours alone"
                    sub="Your own agreement — never joint."
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
                {/* Sent the applicant to a generic Sign In, which
                    discarded the invitation they had just resolved and
                    asked them to log into an account they do not have.
                    The invite is the start of the onboarding journey, so
                    it opens the journey and carries the invite with it. */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    nav.navigate('onboarding', {
                      screen: 'onboarding__checklist',
                      params: {invite},
                    })
                  }
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
                  disabled={code.trim().length < 3 || resolving}
                  style={{
                    opacity: code.trim().length < 3 || resolving ? 0.5 : 1,
                  }}
                  className="bg-keystone_cream rounded-2xl py-4 items-center">
                  <Text className="text-keystone_navy font-inter-bold text-base">
                    {resolving ? 'Checking\u2026' : 'Claim my home'}
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
