import React, {useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {FormField, PrimaryButton, Screen} from '../../../components/kit';
import StepIndicator from '../StepIndicator';
import COLORS from '../../../constants/Theme';
import {useResetPassword} from '../../../hooks';

// Password recovery step 3 (design 8b): reuses the 3c live
// requirement checklist verbatim, retitled. CTA disabled until all
// checks pass (K3).

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

const Reset = () => {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const {resetPasswordMutation, handlePasswordReset} = useResetPassword();

  const checks = useMemo(
    () => ({
      length: password.length >= 8,
      symbol: /[\d!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/.test(password),
    }),
    [password],
  );
  const allMet = checks.length && checks.symbol;

  return (
    <Screen
      title="Reset password"
      back="Verify"
      stickyFooter={
        <PrimaryButton
          label={
            resetPasswordMutation.isPending ? 'Resetting…' : 'Reset password'
          }
          disabled={!allMet || resetPasswordMutation.isPending}
          onPress={() =>
            handlePasswordReset({password, confirmPassword: password})
          }
        />
      }>
      <StepIndicator step={3} total={3} />
      <Text
        style={{
          color: COLORS.keystone_navy,
          fontFamily: 'Inter-Bold',
          fontSize: 28,
          letterSpacing: -0.3,
          marginBottom: 6,
        }}>
        Set a new password
      </Text>
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter',
          fontSize: 15,
          lineHeight: 22,
          marginBottom: 20,
        }}>
        You'll be signed in right after this.
      </Text>

      <View>
        <FormField
          label="New password"
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
      </View>
    </Screen>
  );
};

export default Reset;
