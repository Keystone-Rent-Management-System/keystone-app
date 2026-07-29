import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Text, ToastAndroid, View} from 'react-native';
import {object, z} from 'zod';

import {useMutation} from '@tanstack/react-query';
import {
  Card,
} from '../../../components/premium';
import {
  FormField,
  ListRow,
  PrimaryButton,
  Screen,
  StatusChip,
} from '../../../components/kit';
import COLORS from '../../../constants/Theme';
import {useAuth} from '../../../hooks';
import ProfileServices from '../../../services/ProfileServices';
import {getError} from '../../../utils/getError';

// Account details, both roles (design 3e): identity header with role
// sub-line, real prefilled values (L5), read-only email with VERIFIED
// chip + consequence note, Save pinned and K3-disabled until dirty.
// One role-agnostic component — the landlord variant differs only in
// the sub-line.

export type AccountFormData = {
  phoneNumber: string;
};

const schema = object({
  phoneNumber: z
    .string()
    .regex(/^\+?\d{9,13}$/, 'Enter a valid phone number (digits only)'),
});

const initials = (name?: string) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p.charAt(0).toUpperCase())
    .join('');

const Details = () => {
  const navigation = useNavigation<any>();
  const {isPending, profile, refetch} = useAuth();

  const isLandlord = !!profile?.access_types?.roles?.includes('ROLE_LANDLORD');

  const {handleSubmit, control, watch} = useForm<AccountFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phoneNumber: profile?.phoneNumber || '',
    },
  });

  const newPhoneNumber = watch('phoneNumber');
  const hasPhoneChanged = useMemo(
    () => newPhoneNumber !== profile?.phoneNumber,
    [profile?.phoneNumber, newPhoneNumber],
  );

  const updateProfileMutation = useMutation({
    mutationKey: ['updateProfile', profile?.id],
    mutationFn: async (data: any) => {
      if (!hasPhoneChanged) return;
      await ProfileServices.updatePhoneNumber(data.phoneNumber);
      await refetch();
    },
    onSuccess: () => {
      ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT);
      navigation.goBack();
    },
    onError: error => {
      ToastAndroid.show(
        'Failed to update phone number. ' + getError(error),
        ToastAndroid.SHORT,
      );
    },
  });

  const onSubmit = useCallback(
    (data: AccountFormData) => {
      updateProfileMutation.mutate(data);
    },
    [updateProfileMutation],
  );

  return (
    <Screen
      title="Account"
      back="More"
      stickyFooter={
        <PrimaryButton
          label={updateProfileMutation.isPending ? 'Saving…' : 'Save changes'}
          disabled={!hasPhoneChanged || updateProfileMutation.isPending}
          onPress={handleSubmit(onSubmit)}
        />
      }>
      {/* Identity header — avatar + name + role sub-line */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
        }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: COLORS.keystone_navy,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
          <Text
            style={{
              color: COLORS.keystone_cream,
              fontFamily: 'Inter-SemiBold',
              fontSize: 17,
            }}>
            {initials(profile?.name)}
          </Text>
        </View>
        <View style={{minWidth: 0, flex: 1}}>
          <Text
            numberOfLines={1}
            style={{
              color: COLORS.keystone_navy,
              fontFamily: 'Inter-Bold',
              fontSize: 22,
            }}>
            {isPending ? '—' : profile?.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: COLORS.keystone_slate,
              fontFamily: 'Inter',
              fontSize: 13,
              marginTop: 2,
            }}>
            {isLandlord ? 'Landlord' : 'Tenant'}
          </Text>
        </View>
      </View>

      {/* Full name — read-only until BE supports name updates */}
      <FormField
        label="Full name"
        value={isPending ? '' : profile?.name ?? ''}
        editable={false}
        style={{marginBottom: 14}}
      />

      <Controller
        name="phoneNumber"
        control={control}
        render={({field: {onChange, onBlur, value}, fieldState: {error}}) => (
          <FormField
            label="Phone"
            prefix="🇺🇸 +1"
            placeholder="(512) 555-0100"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
            style={{marginBottom: 14}}
          />
        )}
      />

      {/* Email — read-only with VERIFIED chip + consequence note */}
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter-Medium',
          fontSize: 13,
          marginBottom: 6,
        }}>
        Email
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          minHeight: 52,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: 'rgba(21,37,53,0.16)',
        }}>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            minWidth: 0,
            color: COLORS.keystone_navy,
            fontFamily: 'Inter',
            fontSize: 17,
          }}>
          {isPending ? '' : profile?.username}
        </Text>
        <StatusChip label="Verified" tone="success" />
      </View>
      <Text
        style={{
          color: COLORS.keystone_slate,
          fontFamily: 'Inter',
          fontSize: 13,
          marginTop: 4,
          marginBottom: 16,
        }}>
        Changing your email re-runs verification.
      </Text>

      <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
        <ListRow
          icon="lock"
          title="Change password"
          chevron
          last
          onPress={() => navigation.navigate('more__account_password')}
        />
      </Card>
    </Screen>
  );
};

export default Details;
