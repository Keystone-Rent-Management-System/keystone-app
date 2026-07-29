import {yupResolver} from '@hookform/resolvers/yup';
import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Text, View} from 'react-native';
import {object, string} from 'yup';

import {FormField, PrimaryButton, Screen} from '../../../components/kit';
import COLORS from '../../../constants/Theme';
import {useRegister} from '../../../hooks';
import useGlobals from '../../../provider/store/useGlobals';
import StepIndicator from './StepIndicator';

// Registration step 4 (design 3d): US-first phone input (L4) retires
// the Kenya-flag default; footer sets the KYC + bank expectation
// before the user hits it. BE contract preserved: firstName/lastName/
// phoneNumber/identificationNumber via useRegister.

const schema = object({
  firstName: string().required('Enter your first name').min(1),
  lastName: string().required('Enter your last name').min(1),
  phoneNumber: string()
    .required('Enter your phone number')
    .matches(/^\+?\d{9,13}$/, 'Enter a valid phone number (digits only)'),
  identificationNumber: string()
    .required('Enter your government ID number')
    .min(6, 'ID number looks too short'),
});

const Profile = () => {
  const {
    state: {registering_user},
  } = useGlobals(data => data);

  const {handleSubmit, control} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: registering_user?.firstName || '',
      lastName: registering_user?.lastName || '',
      phoneNumber: registering_user?.phoneNumber || '',
      identificationNumber: registering_user?.identificationNumber || '',
    },
  });

  const {registerTenantMutation, onSubmit} = useRegister();

  const field = (name, props) => (
    <Controller
      name={name}
      control={control}
      render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
        <FormField
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          style={{marginBottom: 14}}
          {...props}
        />
      )}
    />
  );

  return (
    <Screen
      title="Create account"
      back="Password"
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
            Next: verify your identity and connect your bank — that's when
            payouts unlock.
          </Text>
          <PrimaryButton
            label={
              registerTenantMutation.isPending
                ? 'Creating account…'
                : 'Create account'
            }
            disabled={registerTenantMutation.isPending}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      }>
      <StepIndicator step={4} />
      <Text
        style={{
          color: COLORS.keystone_navy,
          fontFamily: 'Inter-Bold',
          fontSize: 28,
          letterSpacing: -0.3,
          marginTop: 8,
          marginBottom: 6,
        }}>
        Introduce yourself
      </Text>
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter',
          fontSize: 15,
          lineHeight: 22,
          marginBottom: 20,
        }}>
        This is how tenants will see you in the app.
      </Text>

      {field('firstName', {
        label: 'First name',
        placeholder: 'Jane',
        autoComplete: 'given-name',
      })}
      {field('lastName', {
        label: 'Last name',
        placeholder: 'Alvarez',
        autoComplete: 'family-name',
      })}
      {field('phoneNumber', {
        label: 'Phone',
        prefix: '🇺🇸 +1',
        placeholder: '(512) 555-0100',
        keyboardType: 'phone-pad',
        autoComplete: 'tel',
      })}
      {field('identificationNumber', {
        label: 'Government ID number',
        icon: 'id',
        placeholder: 'Used once for identity verification',
        keyboardType: 'number-pad',
      })}
    </Screen>
  );
};

export default Profile;
