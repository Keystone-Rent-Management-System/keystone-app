import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {Text} from 'react-native';
import {useForm} from 'react-hook-form';
import {string} from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {CButton, Layout} from '../../../components';
import {EmailSvg} from '../../../assets/icons';
import ControlledInput from '../../../components/general/input/ControlledInput';
import {useMutation} from '@tanstack/react-query';
import AuthServices from '../../../services/AuthServices';
import useGlobals from '../../../provider/store/useGlobals';

const emailSchema = yup.object({
  email: string().email().required(),
});

const Email = () => {
  const navigation = useNavigation();
  const {updateRegisteringUser} = useGlobals(state => state);
  const {handleSubmit, control} = useForm({
    resolver: yupResolver(emailSchema),
  });

  const verifyEmailMutation = useMutation({
    mutationKey: ['verify_email'],
    mutationFn: AuthServices.verifyRegisteringEmail,
    onSuccess: (_, data) => {
      updateRegisteringUser({email: data?.email});
      navigation.navigate('auth__registration_verification');
    },
  });

  const onSubmit = props => {
    verifyEmailMutation.mutate({email: props.email});
  };

  return (
    <Layout ClassName={'px-4'}>
      <ControlledInput
        name="email"
        control={control}
        label={'Email'}
        icon={<EmailSvg />}
        placeholder={'Enter email address'}
        labelClassName={'text-primary text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
      />

      <Text
        className={
          'text-xs font-inter text-grey_1 my-5 tracking-wide leading-4'
        }>
        Creating an account means you agree with the
        <Text className={'text-primary underline'}>
          {' '}
          Privacy Policy
        </Text> and{' '}
        <Text className={'text-primary underline'}>Terms of Service</Text>
      </Text>

      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4'
        }
        onPress={handleSubmit(onSubmit)}
        textClassName={'text-white font'}
        text={
          verifyEmailMutation.isPending
            ? 'Requesting verification'
            : 'Create Account'
        }
        isLoading={verifyEmailMutation.isPending}
      />
    </Layout>
  );
};

export default Email;
