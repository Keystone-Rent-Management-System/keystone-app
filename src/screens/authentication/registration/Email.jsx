import React from 'react';
import {Text, View} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {object, string} from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';

import {FormField, PrimaryButton, Screen} from '../../../components/kit';
import COLORS from '../../../constants/Theme';
import {useVerifyEmail} from '../../../hooks';
import StepIndicator from './StepIndicator';

// Registration step 1 (design 3a): branded canvas screen, S2 header,
// step indicator, question-style title, CTA always on screen (S4/K4).

const emailSchema = object({
  email: string().email().required('Enter your email address'),
});

const Email = () => {
  const {handleSubmit, control} = useForm({
    resolver: yupResolver(emailSchema),
  });

  const {verifyEmailMutation, onSubmit} = useVerifyEmail();

  return (
    <Screen
      title="Create account"
      back="Welcome"
      stickyFooter={
        <View>
          <Text
            style={{
              color: COLORS.keystone_slate,
              fontFamily: 'Inter',
              fontSize: 13,
              lineHeight: 20,
              marginBottom: 12,
            }}>
            By continuing you agree to Keystone's{' '}
            <Text style={{textDecorationLine: 'underline'}}>Terms of Service</Text>
            {' · '}
            <Text style={{textDecorationLine: 'underline'}}>Privacy Policy</Text>
          </Text>
          <PrimaryButton
            label={verifyEmailMutation.isPending ? 'Sending code…' : 'Continue'}
            disabled={verifyEmailMutation.isPending}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      }>
      <StepIndicator step={1} />
      <Text
        style={{
          color: COLORS.keystone_navy,
          fontFamily: 'Inter-Bold',
          fontSize: 28,
          letterSpacing: -0.3,
          marginTop: 8,
          marginBottom: 6,
        }}>
        What's your email?
      </Text>
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter',
          fontSize: 15,
          lineHeight: 22,
          marginBottom: 20,
        }}>
        Landlords start here. Setup takes about 3 minutes — your bank comes later.
      </Text>
      <Controller
        name="email"
        control={control}
        render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
          <FormField
            label="Email"
            icon="mail"
            placeholder="jane@alvarezproperties.com"
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
