import React from 'react';
import {Text} from 'react-native';

import {CButton, Layout} from '../../../components';
import {LabelledCInput} from '../../../components/general/input/CInput';
import {EmailSvg} from '../../../assets/icons';
import {useNavigation} from '@react-navigation/native';

const Email = () => {
  const navigation = useNavigation();
  const handleNextStep = () => {
    navigation.navigate('auth__recovery_verification');
  };

  return (
    <Layout ClassName={'px-4'}>
      <Text className={'text-xs font-inter text-grey_1 mb-2'}>
        Confirm that your email is correct and request recovery PIN to reset
        your password
      </Text>

      <LabelledCInput
        label={'Confirm Email'}
        icon={<EmailSvg />}
        placeholder={'youremail@mail.com'}
        labelClassName={'text-primary text-13'}
        ClassName={'border border-border_grey px-2'}
        InputClassName={'text-xs px-2 text-gray-600 '}
        containerClassName={'mt-4'}
      />

      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4'
        }
        onPress={handleNextStep}
        textClassName={'text-white font'}
        text={'Request Pin'}
      />
    </Layout>
  );
};

export default Email;
