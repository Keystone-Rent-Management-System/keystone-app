import React from 'react';
import {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {ImageSvg} from '../../../../assets/icons/auth';

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
      style={styles.container}
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

      <View className={'justify-center'} style={styles.profileCard}>
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
export default Uploader;

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  profileCard: {
    gap: 4,
  },
});
