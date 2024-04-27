import React from 'react';
import {CButton, Layout} from '../../../components';
import {LockSvg} from '../../../assets/icons';
import {useNavigation} from '@react-navigation/native';
import ControlledPasswordInput from '../../../components/general/input/ControlledPasswordInput';
import {yupResolver} from '@hookform/resolvers/yup';
import {string} from 'yup';
import {useForm} from 'react-hook-form';
import * as yup from 'yup';
import {ToastAndroid} from 'react-native';
import useGlobals from '../../../provider/store/useGlobals';

const schema = yup.object({
  password: string().required().min(6),
  confirmPassword: string().required().min(6),
});

const Password = () => {
  const {
    state: {registering_user},
    updateRegisteringUser,
  } = useGlobals(data => data);

  const navigation = useNavigation();
  const {handleSubmit, control} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      password: registering_user?.password || '',
      confirmPassword: registering_user?.password || '',
    },
  });

  const handleNext = props => {
    // check if passwords match
    if (props.password !== props.confirmPassword) {
      ToastAndroid.show('Passwords do not match', ToastAndroid.SHORT);
    }
    // save password to global state
    else {
      updateRegisteringUser({password: props.password});
      navigation.navigate('auth__registration_profile');
    }
  };
  return (
    <Layout ClassName={'px-5'}>
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
        label={'Confirm Password'}
        icon={<LockSvg />}
        placeholder={'Confirm password'}
        labelClassName={'text-primary text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
        containerClassName={'mt-4'}
        name={'confirmPassword'}
        control={control}
      />

      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4'
        }
        onPress={handleSubmit(handleNext)}
        textClassName={'text-white font'}
        text={'Continue'}
      />
    </Layout>
  );
};
export default Password;
