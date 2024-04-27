import React from 'react';
import {
  Keyboard,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {Layout} from '@/components';
import {EmailSvg, LockSvg} from '../../assets/icons';
import {CButton} from '../../components';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {useForm} from 'react-hook-form';
import ControlledInput from '../../components/general/input/ControlledInput';
import ControlledPasswordInput from '../../components/general/input/ControlledPasswordInput';
import AuthServices from '../../services/AuthServices';
import {useMutation} from '@tanstack/react-query';
import useGlobals from '../../provider/store/useGlobals';

const schema = yup.object({
  username: yup.string().email().required().min(2),
  password: yup.string().required().min(6),
});

const Login = () => {
  const navigation = useNavigation();
  const {handleSubmit, control} = useForm({
    resolver: yupResolver(schema),
  });
  const {updateAuth} = useGlobals(data => data);

  const handleForgotPassword = () => {
    navigation.navigate('auth__recovery_email');
  };

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: AuthServices.login,
    onSuccess: res => {
      updateAuth(res);
      navigation.navigate('bottom-nav');
    },
    onError: err => {
      ToastAndroid.show('Login failed ' + err.response.data?.message, 4000);
    },
  });

  const handleSignin = props => {
    Keyboard.dismiss();
    loginMutation.mutate(props);
  };

  const handleRegister = () => {
    navigation.navigate('auth__registration_email');
  };

  return (
    <Layout ClassName={'px-4 py-4'}>
      <View style={{gap: 5}}>
        <ControlledInput
          label={'Email'}
          icon={<EmailSvg />}
          placeholder={'Enter email address'}
          labelClassName={'text-primary text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-[13px] px-2 text-gray-600 '}
          name={'username'}
          control={control}
        />

        <ControlledPasswordInput
          label={'Password'}
          icon={<LockSvg />}
          placeholder={'Enter password'}
          labelClassName={'text-primary text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-[13px] px-2 text-gray-600 '}
          containerClassName={'mt-4'}
          name={'password'}
          control={control}
        />
      </View>

      <TouchableOpacity
        className={'flex-row space-x-3 mt-4 justify-end'}
        onPress={handleForgotPassword}>
        <Text
          className={
            'text-[13px] font-inter text-primary text-right underline'
          }>
          Forgot password?
        </Text>
      </TouchableOpacity>

      {/*    siginin button   */}
      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-20 inset-x-0 mx-4'
        }
        isLoading={loginMutation.isPending}
        onPress={handleSubmit(handleSignin)}
        textClassName={'text-white font'}
        text={loginMutation.isPending ? 'signing in...' : 'Sign In'}
      />

      <Text
        className={
          'font-inter text-[13px] absolute bottom-12 inset-x-0 text-center'
        }
        style={{color: '#888'}}>
        Don't have an accountsss?{' '}
        <Text
          className={'font-inter-medium underline text-primary'}
          onPress={handleRegister}>
          Sign Up
        </Text>
      </Text>
    </Layout>
  );
};

export default Login;
