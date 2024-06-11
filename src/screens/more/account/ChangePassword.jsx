import React from 'react';
import {Text} from 'react-native';

import {CButton, Layout} from '@/components';
import ControlledPasswordInput from '../../../components/general/input/ControlledPasswordInput';
import {LockSvg} from '../../../assets/icons';
import {yupResolver} from '@hookform/resolvers/yup';
import {string} from 'yup';
import {useForm} from 'react-hook-form';
import * as yup from 'yup';
import {useChangePassword} from '../../../hooks';

const ChangePassword = () => {
  const schema = yup.object({
    currentPassword: string().required().min(6),
    password: string().required().min(6),
    confirmPassword: string().required().min(6),
  });
  const {handleSubmit, control} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {changePasswordMutation, handleChangePassword} = useChangePassword();

  return (
    <Layout ClassName={'px-5 relative'}>
      <ControlledPasswordInput
        label={'New Password'}
        icon={<LockSvg />}
        placeholder={'Enter current password'}
        labelClassName={'text-primary text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
        containerClassName={'mt-4'}
        required
        name={'currentPassword'}
        control={control}
      />

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
      />

      <ControlledPasswordInput
        label={'New Password'}
        icon={<LockSvg />}
        placeholder={'Confirm password'}
        labelClassName={'text-primary text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
        containerClassName={'mt-4'}
        required
        name={'confirmPassword'}
        control={control}
      />

      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-0 inset-x-0 mx-4'
        }
        isLoading={changePasswordMutation.isPending}
        onPress={handleSubmit(handleChangePassword)}>
        <Text className={'text-white font-inter text-13 '}>
          {changePasswordMutation.isPending ? 'Changing' : 'Change Password'}
        </Text>
      </CButton>
    </Layout>
  );
};

export default ChangePassword;
