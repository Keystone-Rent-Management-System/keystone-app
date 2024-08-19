import React, {useState} from 'react';

import {CButton, Layout} from '../../../components';
import {LockSvg} from '../../../assets/icons';
import {yupResolver} from '@hookform/resolvers/yup';
import {object, string} from 'yup';
import {useForm} from 'react-hook-form';
import ControlledPasswordInput from '../../../components/general/input/ControlledPasswordInput';
import {useResetPassword} from '../../../hooks';

const Reset = () => {
  const [passworType, setPasswordType] = useState('password');
  const [confirmationPassworType, setConfirmationPasswordType] =
    useState('password');

  const schema = object({
    password: string().required().min(6),
    confirmPassword: string().required().min(6),
  });
  const {handleSubmit, control} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const {resetPasswordMutation, handlePasswordReset} = useResetPassword();

  return (
    <Layout ClassName={'px-4'}>
      <ControlledPasswordInput
        label={'New Password'}
        icon={<LockSvg />}
        placeholder={'Enter password'}
        labelClassName={'text-primary text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
        containerClassName={'mt-4'}
        required
        name={'password'}
        control={control}
        type={passworType}
        handleEyeClick={setPasswordType}
      />

      <ControlledPasswordInput
        label={'Confirm Password'}
        icon={<LockSvg />}
        placeholder={'Confirm password'}
        labelClassName={'text-primary text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
        containerClassName={'mt-4'}
        name={'confirmPassword'}
        control={control}
        type={confirmationPassworType}
        handleEyeClick={setConfirmationPasswordType}
      />

      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4'
        }
        isLoading={resetPasswordMutation.isPending}
        onPress={handleSubmit(handlePasswordReset)}
        textClassName={'text-white font'}
        text={
          resetPasswordMutation.isPending ? 'Reseting...' : 'Complete Reset'
        }
      />
    </Layout>
  );
};

export default Reset;
