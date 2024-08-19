import React from 'react';
import {Text} from 'react-native';

import {CButton, Layout} from '../../../components';
import {EmailSvg} from '../../../assets/icons';
import {object, string} from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useForm} from 'react-hook-form';
import ControlledInput from '../../../components/general/input/ControlledInput';
import {useRequestPasswordReset} from '../../../hooks';

const Email = () => {
  const schema = object({
    email: string().email().required().min(2),
  });
  const {handleSubmit, control} = useForm({
    resolver: yupResolver(schema),
  });

  const {requestPasswordResetMutation, handleRequestPasswordReset} =
    useRequestPasswordReset();

  return (
    <Layout ClassName={'px-4'}>
      <Text className={'text-xs font-inter text-grey_1 mb-2'}>
        Confirm that your email is correct and request recovery PIN to reset
        your password
      </Text>

      <ControlledInput
        label={'Email'}
        icon={<EmailSvg />}
        placeholder={'Enter email address'}
        labelClassName={'text-primary text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-[13px] px-2 text-gray-600 '}
        name={'email'}
        control={control}
      />

      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4'
        }
        isLoading={requestPasswordResetMutation.isPending}
        onPress={handleSubmit(handleRequestPasswordReset)}
        textClassName={'text-white font'}
        text={
          requestPasswordResetMutation.isPending
            ? 'Requesting Pin...'
            : 'Request Pin'
        }
      />
    </Layout>
  );
};

export default Email;
