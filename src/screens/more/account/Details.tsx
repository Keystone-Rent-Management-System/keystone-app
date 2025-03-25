import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {useForm} from 'react-hook-form';
import {Text, ToastAndroid, TouchableOpacity, View} from 'react-native';
import {object, z} from 'zod';

import {useMutation} from '@tanstack/react-query';
import {
  EditSvg,
  EmailSvg,
  FlagSvg,
  LockSvg,
  RightArrowSvg,
} from '../../../assets/icons';
import {DetailsHeader, Layout} from '../../../components';
import {LabelledCInput} from '../../../components/general/input/CInput';
import ControlledInput from '../../../components/general/input/ControlledInput';
import {useAuth} from '../../../hooks';
import ProfileServices from '../../../services/ProfileServices';
import {getError} from '../../../utils/getError';

export type AccountFormData = {
  phoneNumber: string;
};

const schema = object({
  phoneNumber: z
    .string()
    .regex(
      /^(2547\d{8}|2541\d{8}|07\d{8}|01\d{8}|7\d{8}|1\d{8})$/,
      'Phone number must be in one of the following formats: 2547XXXXXXXX, 2541XXXXXXXX, 07XXXXXXXX, 01XXXXXXXX, 7XXXXXXXX, or 1XXXXXXXX',
    ),
});

const Details = () => {
  const navigation = useNavigation<any>();
  const {isPending, profile, refetch} = useAuth();

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

  const handleChangePassword = () => {
    navigation.navigate('more__account_password');
  };

  const updateProfileMutation = useMutation({
    mutationKey: ['updateProfile', profile?.id],
    mutationFn: async (data: any) => {
      if (hasPhoneChanged) {
        await ProfileServices.updatePhoneNumber(data.phoneNumber);
        await refetch();
      } else {
        return;
      }
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
    // @ts-ignore
    <Layout>
      <DetailsHeader
        showSave={hasPhoneChanged}
        handleSave={handleSubmit(onSubmit)}
        isLoading={updateProfileMutation.isPending}
        loadingMessage={updateProfileMutation.isPending && 'updating...'}
      />

      {/* body */}
      {!isPending && <AvatarSection data={profile} />}

      <View className="px-5">
        {/* name input */}
        <LabelledCInput
          label={'Name'}
          labelClassName={'text-gray-600 text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'px-2 text-gray-600 text-xs'}
          value={!isPending && profile?.name}
        />
        <ControlledInput
          label={'Phone Number'}
          icon={
            <View className={'items-center justify-center'}>
              <FlagSvg />
            </View>
          }
          labelClassName={'text-gray-600 text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-xs px-2 text-gray-600 '}
          containerClassName={'mt-4'}
          name={'phoneNumber'}
          keyboardType={'number-pad'}
          control={control}
          type={'number'}
          rules={[]}
        />

        {/* phone input */}
        <LabelledCInput
          label={'Email'}
          icon={
            <View className={'items-center justify-center'}>
              <EmailSvg />
            </View>
          }
          labelClassName={'text-gray-600 text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-xs px-2 text-gray-600 '}
          containerClassName={'my-4'}
          value={!isPending && profile?.username}
          // @ts-ignore
          type={'email'}
        />
        <TouchableOpacity
          className={'flex-row space-x-3 mt-2'}
          onPress={handleChangePassword}>
          <LockSvg />

          <View className={'flex-1'}>
            <Text className={'text-xs font-open-sauce-sans text-primary'}>
              Change Password
            </Text>
          </View>

          <RightArrowSvg size="20" />
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const AvatarSection = ({data}: any) => (
  <View className={'flex-row justify-center py-5 '}>
    {/* profile */}
    <View
      className={
        'h-16 w-16 bg-primary rounded-full justify-center items-center relative'
      }>
      <Text className={'text-white font-open-sauce-sans-semibold text-lg'}>{`${data?.name
        ?.split(' ')[0]
        ?.charAt(0)}${data?.name?.split(' ')[1]?.charAt(0)}`}</Text>
      <TouchableOpacity
        className={
          'bg-bg_pale h-5 w-5 flex-row justify-center items-center rounded-full absolute bottom-1 -right-1'
        }>
        <EditSvg />
      </TouchableOpacity>
    </View>
  </View>
);
export default Details;
