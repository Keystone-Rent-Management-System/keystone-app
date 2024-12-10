import React from 'react';
import {CButton, Layout} from '../../../components';
import {FlagSvg, UserSvg} from '../../../assets/icons';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {object, string} from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useForm} from 'react-hook-form';
import useGlobals from '../../../provider/store/useGlobals';
import ControlledInput from '../../../components/general/input/ControlledInput';
import {useRegister} from '../../../hooks';

const schema = object({
  firstName: string().required().min(1),
  lastName: string().required().min(1),
  phoneNumber: string().required().length(9),
  identificationNumber: string().required().min(6),
});

const Profile = () => {
  const {
    state: {registering_user},
  } = useGlobals(data => data);

  const {handleSubmit, control} = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: registering_user?.firstName || '',
      lastName: registering_user?.lastName || '',
      phoneNumber: registering_user?.phoneNumber || '',
      identificationNumber: registering_user?.identificationNumber || '',
    },
  });

  const {registerTenantMutation, onSubmit} = useRegister();

  return (
    <Layout ClassName={'p-4'}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View className={'flex-col '} style={styles.container}>
          {/* <Uploader /> */}

          <ControlledInput
            label={'Enter First Name'}
            icon={<UserSvg />}
            placeholder={'Enter first name'}
            labelClassName={'text-primary text-13'}
            ClassName={'border border-border_grey px-2'}
            InputClassName={'text-[13px] px-2 text-gray-600 '}
            name={'firstName'}
            control={control}
          />

          <ControlledInput
            label={'Enter Last Name'}
            icon={<UserSvg />}
            placeholder={'Enter last name'}
            labelClassName={'text-primary text-13'}
            ClassName={'border border-border_grey px-2'}
            InputClassName={'text-[13px] px-2 text-gray-600 '}
            name={'lastName'}
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
            keyboardType={'number-pad'}
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
            keyboardType={'number-pad'}
            control={control}
          />
        </View>
      </ScrollView>

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
  <View className={'flex-row items-center'} style={styles.prePhone}>
    <FlagSvg />

    <Text className={'text-neutral-500 font-inter text-[13px]'}>+254</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  prePhone: {
    gap: 3,
  },
  contentContainer: {
    paddingBottom: 80,
  },
});
