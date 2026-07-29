import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput} from 'react-native';
import {View} from 'react-native';

import {PrimaryButton, Screen} from '../../../components/kit';
import StepIndicator from '../registration/StepIndicator';
import COLORS from '../../../constants/Theme';
import useGlobals from '../../../provider/store/useGlobals';

// Password recovery step 2 (design 8b): reuses the 3b code boxes
// verbatim, retitled. K3-disabled CTA until 6 digits.

const VERIFICATION_LENGTH = 6;
const RESEND_COOLDOWN_S = 60;

export default function Verification({navigation}) {
  const otpInputRef = useRef();

  const {
    state: {reset_password},
    updateResetPassword,
  } = useGlobals(data => data);

  const [otp, setOtp] = useState([]);
  const [focused, setFocused] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const codeArray = useMemo(() => new Array(VERIFICATION_LENGTH).fill(0), []);
  const complete = otp.length === VERIFICATION_LENGTH;

  const handleContinue = () => {
    if (!complete) return;
    updateResetPassword({token: parseInt(otp.join(''), 10)});
    navigation.navigate('auth__recovery_reset');
  };

  const focusInput = () => {
    otpInputRef.current?.focus();
    setFocused(true);
  };

  const renderBox = (_, index) => {
    const digit = otp[index] ?? '';
    const isCursor =
      focused &&
      (index === otp.length || (complete && index === VERIFICATION_LENGTH - 1));
    return (
      <Pressable
        key={index}
        onPress={focusInput}
        style={[styles.box, isCursor && styles.boxActive]}>
        <Text style={styles.boxText}>{digit || (isCursor ? '|' : '')}</Text>
      </Pressable>
    );
  };

  return (
    <Screen
      title="Reset password"
      back="Email"
      stickyFooter={
        <PrimaryButton label="Verify" disabled={!complete} onPress={handleContinue} />
      }>
      <TextInput
        ref={otpInputRef}
        keyboardType="number-pad"
        style={styles.hidden}
        maxLength={VERIFICATION_LENGTH}
        onChangeText={text => setOtp(text.replace(/\D/g, '').split(''))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus
      />

      <StepIndicator step={2} total={3} />
      <Text style={styles.title}>Check your inbox</Text>
      <Text style={styles.sub}>
        We sent a 6-digit code to{' '}
        <Text style={{color: COLORS.keystone_navy, fontFamily: 'Inter-SemiBold'}}>
          {reset_password?.email ?? 'your email'}
        </Text>
        .{' '}
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('auth__recovery_email')}>
          Wrong email?
        </Text>
      </Text>

      <View style={styles.boxRow}>{codeArray.map(renderBox)}</View>

      <Text style={styles.resend}>
        Didn't get it?{' '}
        {cooldown > 0 ? (
          <Text style={{color: 'rgba(59,83,102,0.6)'}}>
            Resend in 0:{String(cooldown).padStart(2, '0')}
          </Text>
        ) : (
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('auth__recovery_email')}>
            Resend code
          </Text>
        )}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hidden: {position: 'absolute', opacity: 0, height: 1, width: 1},
  step: {
    color: COLORS.keystone_slate,
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  title: {
    color: COLORS.keystone_navy,
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  sub: {
    color: COLORS.keystone_slate,
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  link: {color: COLORS.keystone_slate, textDecorationLine: 'underline'},
  boxRow: {flexDirection: 'row', gap: 8, marginBottom: 16},
  box: {
    flex: 1,
    aspectRatio: 0.9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(21,37,53,0.16)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {borderWidth: 2, borderColor: COLORS.keystone_navy},
  boxText: {
    color: COLORS.keystone_navy,
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    fontVariant: ['tabular-nums'],
  },
  resend: {color: COLORS.keystone_slate, fontFamily: 'Inter', fontSize: 15},
});
