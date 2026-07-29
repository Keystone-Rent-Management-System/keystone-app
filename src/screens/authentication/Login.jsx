import React, {useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {yupResolver} from '@hookform/resolvers/yup';
import {object, string} from 'yup';
import {Controller, useForm} from 'react-hook-form';

import {FormField, PrimaryButton, Screen} from '../../components/kit';
import {KSTile} from '../../components/premium';
import COLORS from '../../constants/Theme';
import {useLogin} from '../../hooks';
import {getError} from '../../utils/getError';

// Sign in (design 8a/8g): registration scaffold — S2 header, L4
// fields, pinned CTA. One account for both roles, stated up front;
// role routing happens after sign-in, never a role picker. Errors
// name the problem instead of "invalid credentials".

const schema = object({
  username: string().email('Enter a valid email').required('Enter your email'),
  password: string().required('Enter your password').min(6),
});

const Login = () => {
  const navigation = useNavigation();
  const [show, setShow] = useState(false);
  const {handleSubmit, control} = useForm({resolver: yupResolver(schema)});
  const passwordRef = useRef(null);

  const {loginMutation, handleSignin} = useLogin();
  const submit = handleSubmit(handleSignin);

  const apiError = loginMutation.isError
    ? getError(loginMutation.error) ||
      "That password doesn't match this email."
    : null;

  return (
    <Screen
      title="Sign in"
      back="Welcome"
      stickyFooter={
        <View>
          <PrimaryButton
            label={loginMutation.isPending ? 'Signing in…' : 'Sign in'}
            disabled={loginMutation.isPending}
            onPress={submit}
          />
          <Text
            style={{
              color: COLORS.keystone_slate,
              fontFamily: 'Inter',
              fontSize: 14,
              textAlign: 'center',
              marginTop: 12,
            }}>
            New here?{' '}
            <Text
              style={{
                fontFamily: 'Inter-SemiBold',
                color: COLORS.keystone_navy,
                textDecorationLine: 'underline',
              }}
              onPress={() => navigation.navigate('auth__registration_email')}>
              Create an account
            </Text>
          </Text>
        </View>
      }>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <KSTile style={{marginTop: 4, marginBottom: 20}} />
        <Text
          style={{
            color: COLORS.keystone_navy,
            fontFamily: 'Inter-Bold',
            fontSize: 28,
            letterSpacing: -0.3,
            marginBottom: 6,
          }}>
          Welcome back
        </Text>
        <Text
          style={{
            color: COLORS.keystone_slate,
            fontFamily: 'Inter',
            fontSize: 15,
            lineHeight: 22,
            marginBottom: 20,
          }}>
          One account for landlords and renters.
        </Text>

        <Controller
          name="username"
          control={control}
          render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
            <FormField
              label="Email"
              icon="mail"
              placeholder="sarah.chen@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
              autoFocus
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={error?.message}
              style={{marginBottom: 14}}
            />
          )}
        />

        <View>
          <Controller
            name="password"
            control={control}
            render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
              <FormField
                label="Password"
                icon="lock"
                placeholder="••••••••"
                secureTextEntry={!show}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                inputRef={passwordRef}
                onSubmitEditing={submit}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
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

        {apiError ? (
          <Text
            style={{
              color: '#B32020',
              fontFamily: 'Inter',
              fontSize: 14,
              lineHeight: 20,
              marginTop: 10,
            }}>
            {apiError}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={() => navigation.navigate('auth__recovery_email')}
          style={{alignSelf: 'flex-start', marginTop: 12}}>
          <Text
            style={{
              color: COLORS.keystone_navy,
              fontFamily: 'Inter-Medium',
              fontSize: 14,
              textDecorationLine: 'underline',
            }}>
            Forgot password?
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default Login;
