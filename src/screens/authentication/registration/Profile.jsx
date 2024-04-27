import React, {useState} from 'react';
import {CButton, Layout} from '../../../components';
import {FlagSvg, UserSvg} from '../../../assets/icons';
import {
  Image,
  Keyboard,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {ImageSvg} from '../../../assets/icons/auth';
import {launchImageLibrary} from 'react-native-image-picker';
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
      <View className={'flex-col '} style={{gap: 15}}>
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
  <View className={'flex-row items-center'} style={{gap: 3}}>
    <FlagSvg />

    <Text className={'text-neutral-500 font-inter text-[13px]'}>+254</Text>
  </View>
);

const Uploader = () => {
  const [profileImage, setProfileImage] = useState({});
  const handleUpload = async () => {
    const {assets} = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    setProfileImage(assets?.at(0));
  };

  return (
    <TouchableOpacity
      className={
        'flex-row bg-[#7DA3FF10] p-3 border border-neutral-200 rounded-xl'
      }
      style={{
        gap: 12,
      }}
      onPress={handleUpload}>
      {profileImage?.uri ? (
        <Image
          className={'h-14 w-14 rounded-full object-cover'}
          source={{
            uri: profileImage?.uri,
          }}
        />
      ) : (
        <View
          className={
            'h-12 w-12 rounded-full bg-white items-center justify-center border border-neutral-100'
          }>
          <ImageSvg />
        </View>
      )}

      <View className={'justify-center'} style={{gap: 4}}>
        <Text className={'text-primary font-inter-medium text-sm'}>
          Add profile photo
        </Text>

        <Text className={'text-neutral-500 font-inter text-xs'}>
          upload or take new photo
        </Text>
      </View>

      <TouchableOpacity
        className={'rounded-full border border-neutral-100 px-3 m-auto'}
        onPress={handleUpload}>
        <Text className={'text-primary font-inter-medium text-xs'}>Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
