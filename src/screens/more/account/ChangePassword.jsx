import React from 'react';
import {Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {CButton, Layout} from '@/components';
import {LabelledCInput} from '@/components/general/CInput';

const ChangePassword = () => {
  const navigation = useNavigation();

  const handleChangePassword = () => {
    navigation.navigate('bottom-nav', {screen: 'more'});
  };

  return (
    <Layout ClassName={'px-5 relative'}>
      <LabelledCInput
        label={'Current Password'}
        labelClassName={'text-gray-600 text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
        containerClassName={'mt-4'}
        value={'*******'}
      />

      <LabelledCInput
        label={'New Password'}
        labelClassName={'text-gray-600 text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
        containerClassName={'mt-4'}
        value={'*******'}
      />

      <LabelledCInput
        label={'Confirm Password'}
        labelClassName={'text-gray-600 text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
        containerClassName={'mt-4'}
        value={'*******'}
      />

      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-0 inset-x-0 mx-4'
        }
        onPress={handleChangePassword}>
        <Text className={'text-white font-inter text-13 '}>
          Change Password
        </Text>
      </CButton>
    </Layout>
  );
};

export default ChangePassword;
