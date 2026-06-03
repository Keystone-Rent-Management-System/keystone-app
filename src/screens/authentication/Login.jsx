import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Layout} from '@/components';
import {EmailSvg, LockSvg} from '../../assets/icons';
import {CButton} from '../../components';
import {yupResolver} from '@hookform/resolvers/yup';
import {object, string} from 'yup';
import {useForm} from 'react-hook-form';
import ControlledInput from '../../components/general/input/ControlledInput';
import ControlledPasswordInput from '../../components/general/input/ControlledPasswordInput';
import {useLogin} from '../../hooks';

const schema = object({
  username: string().email().required().min(2),
  password: string().required().min(6),
});

const Login = () => {
  const [passworType, setPasswordType] = useState('password');

  const navigation = useNavigation();
  const {handleSubmit, control} = useForm({
    resolver: yupResolver(schema),
  });

  const handleForgotPassword = () => {
    navigation.navigate('auth__recovery_email');
  };

  const handleRegister = () => {
    navigation.navigate('auth__registration_email');
  };

  const {loginMutation, handleSignin} = useLogin();

  return (
    <Layout ClassName={'px-4 py-4'}>
      <View style={styles.container}>
        <ControlledInput
          label={'Email'}
          icon={<EmailSvg />}
          placeholder={'Enter email address'}
          labelClassName={'text-keystone_navy text-13 font-inter-medium'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-[13px] px-2 text-gray-600 font-inter'}
          name={'username'}
          control={control}
        />

        <ControlledPasswordInput
          label={'Password'}
          icon={<LockSvg />}
          placeholder={'Enter password'}
          labelClassName={'text-keystone_navy text-13 font-inter-medium'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-[13px] px-2 text-gray-600 font-inter'}
          containerClassName={'mt-4'}
          name={'password'}
          control={control}
          type={passworType}
          handleEyeClick={setPasswordType}
        />
      </View>

      <TouchableOpacity
        className={'flex-row space-x-3 mt-4 justify-end'}
        onPress={handleForgotPassword}>
        <Text
          className={
            'text-[13px] font-inter-medium text-keystone_navy text-right underline'
          }>
          Forgot password?
        </Text>
      </TouchableOpacity>

      {/*    sign-in button   */}
      <CButton
        ClassName={
          'bg-keystone_navy text-white py-3.5 mb-3 absolute bottom-20 inset-x-0 mx-4'
        }
        isLoading={loginMutation.isPending}
        onPress={handleSubmit(handleSignin)}
        textClassName={'text-white font-inter-semibold'}
        text={loginMutation.isPending ? 'Signing in…' : 'Sign In'}
      />

      <Text
        className={
          'font-inter text-[13px] absolute bottom-12 inset-x-0 text-center'
        }
        style={styles.haveNoAccount}>
        Don&apos;t have an account?{' '}
        <Text
          className={'font-inter-semibold underline text-keystone_navy'}
          onPress={handleRegister}>
          Sign Up
        </Text>
      </Text>
    </Layout>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  haveNoAccount: {
    color: '#888',
  },
});
