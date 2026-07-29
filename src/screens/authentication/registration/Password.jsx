import React, {useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Icon from '../../../components/premium/icons';
import {FormField, PrimaryButton, Screen} from '../../../components/kit';
import COLORS from '../../../constants/Theme';
import useGlobals from '../../../provider/store/useGlobals';
import StepIndicator from './StepIndicator';

// Registration step 3 (design 3c): live requirement checklist replaces
// error-after-submit; reassurance sub-line keeps the microcopy voice.

const Requirement = ({met, children}) => (
  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
    <Text
      style={{
        fontSize: 15,
        color: met ? '#037147' : 'rgba(21,37,53,0.45)',
        fontFamily: 'Inter-SemiBold',
      }}>
      {met ? '✓' : '○'}
    </Text>
    <Text
      style={{
        fontSize: 15,
        fontFamily: 'Inter',
        color: met ? '#037147' : 'rgba(21,37,53,0.45)',
      }}>
      {children}
    </Text>
  </View>
);

const Password = () => {
  const navigation = useNavigation();
  const {
    state: {registering_user},
    updateRegisteringUser,
  } = useGlobals(data => data);

  const [password, setPassword] = useState(registering_user?.password || '');
  const [show, setShow] = useState(false);

  const checks = useMemo(() => {
    const email = (registering_user?.email || '').toLowerCase();
    const local = email.split('@')[0];
    return {
      length: password.length >= 8,
      symbol: /[\d!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/.test(password),
      notEmail:
        password.length > 0 &&
        (!local || !password.toLowerCase().includes(local)),
    };
  }, [password, registering_user?.email]);

  const allMet = checks.length && checks.symbol && checks.notEmail;

  const handleNext = () => {
    updateRegisteringUser({password});
    navigation.navigate('auth__registration_profile');
  };

  return (
    <Screen
      title="Create account"
      back="Verify"
      stickyFooter={
        <PrimaryButton label="Continue" disabled={!allMet} onPress={handleNext} />
      }>
      <StepIndicator step={3} />
      <Text
        style={{
          color: COLORS.keystone_navy,
          fontFamily: 'Inter-Bold',
          fontSize: 28,
          letterSpacing: -0.3,
          marginTop: 8,
          marginBottom: 6,
        }}>
        Set a password
      </Text>
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter',
          fontSize: 15,
          lineHeight: 22,
          marginBottom: 20,
        }}>
        This protects your account — your bank credentials are never stored by
        Keystone.
      </Text>

      <View>
        <FormField
          label="Password"
          icon="lock"
          placeholder="At least 8 characters"
          secureTextEntry={!show}
          autoCapitalize="none"
          autoFocus
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShow(v => !v)}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
          style={{position: 'absolute', right: 14, top: 33}}>
          <Text
            style={{
              color: COLORS.keystone_slate,
              fontFamily: 'Inter-SemiBold',
              fontSize: 15,
            }}>
            {show ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{gap: 6, marginTop: 14}}>
        <Requirement met={checks.length}>At least 8 characters</Requirement>
        <Requirement met={checks.symbol}>A number or symbol</Requirement>
        <Requirement met={checks.notEmail}>Not your email</Requirement>
      </View>
    </Screen>
  );
};

export default Password;
