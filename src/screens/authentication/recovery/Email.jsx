import React from 'react';
import {Text} from 'react-native';
import {object, string} from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {Controller, useForm} from 'react-hook-form';

import {FormField, PrimaryButton, Screen} from '../../../components/kit';
import StepIndicator from '../StepIndicator';
import COLORS from '../../../constants/Theme';
import {useRequestPasswordReset} from '../../../hooks';

// Password recovery step 1 (design 8b): registration scaffold with
// the money-safety reassurance line — resetting a password never
// touches rent or payment history.

const schema = object({
  email: string().email('Enter a valid email').required('Enter your email'),
});

const Email = () => {
  const {handleSubmit, control} = useForm({resolver: yupResolver(schema)});
  const {requestPasswordResetMutation, handleRequestPasswordReset} =
    useRequestPasswordReset();

  return (
    <Screen
      title="Reset password"
      back="Sign in"
      stickyFooter={
        <PrimaryButton
          label={
            requestPasswordResetMutation.isPending
              ? 'Sending code…'
              : 'Send code'
          }
          disabled={requestPasswordResetMutation.isPending}
          onPress={handleSubmit(handleRequestPasswordReset)}
        />
      }>
      <StepIndicator step={1} total={3} />
      <Text
        style={{
          color: COLORS.keystone_navy,
          fontFamily: 'Inter-Bold',
          fontSize: 28,
          letterSpacing: -0.3,
          marginBottom: 6,
        }}>
        Locked out?
      </Text>
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter',
          fontSize: 15,
          lineHeight: 22,
          marginBottom: 20,
        }}>
        Enter your email and we'll send a 6-digit code. Your rent and payment
        history are safe — resetting your password never touches them.
      </Text>

      <Controller
        name="email"
        control={control}
        render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
          <FormField
            label="Email"
            icon="mail"
            placeholder="sarah.chen@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
          />
        )}
      />
    </Screen>
  );
};

export default Email;
