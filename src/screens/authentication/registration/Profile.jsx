import React from 'react';
import {CButton, Layout} from '../../../components';
import {FlagSvg, UserSvg} from '../../../assets/icons';
import {Keyboard, StyleSheet, Text, ToastAndroid, View} from 'react-native';
import {string} from 'yup';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useForm} from 'react-hook-form';
import useGlobals from '../../../provider/store/useGlobals';
import {useMutation} from '@tanstack/react-query';
import AuthServices from '../../../services/AuthServices';
import ControlledInput from '../../../components/general/input/ControlledInput';
import {useNavigation} from '@react-navigation/native';

const schema = yup.object({
  name: string().required().min(2),
  phoneNumber: string().required().min(10).max(13),
  identificationNumber: string().required().min(6),
});

const Profile = () => {
  const navigation = useNavigation();
  const {
    state: {registering_user},
    updateRegisteringUser,
    resetRegisteringUser,
  } = useGlobals(data => data);
  const {handleSubmit, control} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: registering_user?.name || '',
      phoneNumber: registering_user?.phoneNumber || '',
      identificationNumber: registering_user?.identificationNumber || '',
    },
  });

  const registerTenantMutation = useMutation({
    mutationKey: ['register_tenant'],
    mutationFn: AuthServices.registerTenant,
    onSuccess: () => {
      ToastAndroid.show(
        'Registration successful. Signin to the created account',
        ToastAndroid.SHORT,
      );
      navigation.navigate('auth__login');
      resetRegisteringUser();
    },
    onError: err => {
      ToastAndroid.show(
        'Registration failed ' + err.response.data?.message,
        ToastAndroid.SHORT,
      );

      if (
        err.response?.data?.message
          ?.toLowerCase()
          ?.includes('invalid email or token')
      ) {
        navigation.navigate('auth__registration_verification');
      }
    },
  });

  const onSubmit = props => {
    Keyboard.dismiss();
    // update details to global state incase mutation is not successful
    const {name, phoneNumber, identificationNumber} = props;
    updateRegisteringUser({
      name,
      phoneNumber,
      identificationNumber,
    });

    const {name: fullName, ...rest} = registering_user;

    registerTenantMutation.mutate({
      firstName: fullName.split(' ')?.at(0),
      lastName: fullName.split(' ')?.at(1) || '',
      identificationType: 'NATIONAL_ID',
      ...rest,
    });
  };

  return (
    <Layout ClassName={'p-4'}>
      <View className={'flex-col '} style={styles.container}>
        {/* <Uploader /> */}

        <ControlledInput
          label={'Enter Name'}
          icon={<UserSvg />}
          placeholder={'Enter full name'}
          labelClassName={'text-primary text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-[13px] px-2 text-gray-600 '}
          name={'name'}
          control={control}
        />

        <ControlledInput
          label={'Phone Number'}
          icon={<PrePhone />}
          placeholder={'Enter number'}
          labelClassName={'text-primary text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-[13px] px-2 text-gray-600 '}
          name={'phoneNumber'}
          control={control}
        />

        <ControlledInput
          label={'ID Number'}
          icon={<UserSvg />}
          placeholder={'Enter ID Number'}
          labelClassName={'text-primary text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-[13px] px-2 text-gray-600 '}
          name={'identificationNumber'}
          control={control}
        />
      </View>

      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4'
        }
        onPress={handleSubmit(onSubmit)}
        isLoading={registerTenantMutation.isPending}
        textClassName={'text-white font'}
        text={
          registerTenantMutation.isPending
            ? 'Creating profile...'
            : 'Complete Profile'
        }
      />
    </Layout>
  );
};
export default Profile;

const PrePhone = () => (
  <View className={'flex-row items-center'} style={styles.prePhone}>
    <FlagSvg />

    <Text className={'text-neutral-500 font-inter text-[13px]'}>+254</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  prePhone: {
    gap: 3,
  },
});
