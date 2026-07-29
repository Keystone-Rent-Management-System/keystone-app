import React, {useMemo, useState} from 'react';
import {ActivityIndicator, StatusBar, Text, TouchableOpacity, View} from 'react-native';

import {FormField, PrimaryButton, Screen} from '../../../components/kit';
import COLORS from '../../../constants/Theme';
import {useChangePassword} from '../../../hooks';

// Change password (design 8e). Reuses the 3c live requirement
// checklist; the consequence line ("everywhere else signs out") is
// stated before the action; CTA disabled until all checks pass (K3).

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

const ChangePassword = () => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [show, setShow] = useState(false);

  const {changePasswordMutation, handleChangePassword} = useChangePassword();

  const checks = useMemo(
    () => ({
      length: next.length >= 8,
      symbol: /[\d!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/.test(next),
      different: next.length > 0 && next !== current,
    }),
    [next, current],
  );
  const allMet =
    current.length >= 6 && checks.length && checks.symbol && checks.different;

  const submit = () =>
    handleChangePassword({
      currentPassword: current,
      password: next,
      confirmPassword: next,
    });

  return (
    <Screen
      title="Change password"
      back="Account"
      stickyFooter={
        changePasswordMutation.isPending ? (
          <View style={{minHeight: 52, justifyContent: 'center'}}>
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        ) : (
          <PrimaryButton label="Update password" disabled={!allMet} onPress={submit} />
        )
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <FormField
        label="Current password"
        icon="lock"
        placeholder="••••••••"
        secureTextEntry
        autoCapitalize="none"
        value={current}
        onChangeText={setCurrent}
        style={{marginBottom: 14}}
      />

      <View>
        <FormField
          label="New password"
          icon="lock"
          placeholder="At least 8 characters"
          secureTextEntry={!show}
          autoCapitalize="none"
          value={next}
          onChangeText={setNext}
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
        <Requirement met={checks.different}>
          Different from your current password
        </Requirement>
      </View>

      {/* Consequence stated before the action (8e) */}
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter',
          fontSize: 13,
          lineHeight: 20,
          marginTop: 20,
        }}>
        You'll stay signed in on this device. Everywhere else signs out.
      </Text>
    </Screen>
  );
};

export default ChangePassword;
