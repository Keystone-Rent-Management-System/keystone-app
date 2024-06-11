import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {DetailsHeader, Layout} from '@/components';
import {
  EditSvg,
  EmailSvg,
  FlagSvg,
  LockSvg,
  RightArrowSvg,
} from '@/assets/icons';
import {LabelledCInput} from '@/components/general/input/CInput';
import {useAuth} from '../../../hooks';

const Details = () => {
  const navigation = useNavigation();

  const handleChangePassword = () => {
    navigation.navigate('more__account_password');
  };

  const {data} = useAuth();

  return (
    <Layout>
      <DetailsHeader />

      {/* body */}
      <AvatarSection data={data} />

      <View className="px-5">
        {/* name input */}
        <LabelledCInput
          label={'Name'}
          labelClassName={'text-gray-600 text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'px-2 text-gray-600 text-xs'}
          value={data?.data?.name}
        />

        {/* phone input */}
        <LabelledCInput
          label={'Phone'}
          icon={
            <View className={'items-center justify-center'}>
              <FlagSvg />
            </View>
          }
          labelClassName={'text-gray-600 text-13'}
          ClassName={'border border-border_grey px-2'}
          InputClassName={'text-xs px-2 text-gray-600 '}
          containerClassName={'mt-4'}
          value={data?.data?.phoneNumber}
          type={'number'}
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
          value={data?.data?.username}
          type={'email'}
        />

        <TouchableOpacity
          className={'flex-row space-x-3 mt-2'}
          onPress={handleChangePassword}>
          <LockSvg />

          <View className={'flex-1'}>
            <Text className={'text-xs font-inter text-primary'}>
              Change Password
            </Text>
          </View>

          <RightArrowSvg size="20" />
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const AvatarSection = ({data}) => (
  <View className={'flex-row justify-center py-5 '}>
    {/* profile */}
    <View
      className={
        'h-16 w-16 bg-primary rounded-full justify-center items-center relative'
      }>
      <Text
        className={
          'text-white font-inter-semibold text-lg'
        }>{`${data?.data?.name?.split(' ')[0]?.charAt(0)}${data?.data?.name
        ?.split(' ')[1]
        ?.charAt(0)}`}</Text>
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
