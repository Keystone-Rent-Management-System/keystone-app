import React, {forwardRef, useState} from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {CustomBottomSheet} from '../index';
import {CButton} from '../../general';
import {CloseSvg} from '@/assets/icons';
import COLORS from '../../../constants/Theme';
import {CameraSvg} from '../../../assets/icons';
import {useMutation} from '@tanstack/react-query';
import HelpServices from '../../../services/help';

const RequestRepair = forwardRef((props, ref) => {
  // saves image
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleCamera = async () => {
    const img = await launchCamera(
      {
        mediaType: 'photo',
        maxHeight: 1000,
        maxWidth: 1000,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          return;
        }
        setImage(response.uri);
      },
    );
    setImage(img?.assets?.at(0));
  };

  const renderImage = () => {
    if (image?.uri) {
      return (
        <Image
          source={{uri: image?.uri}}
          alt="img"
          className={'w-full h-full rounded-xl'}
          resizeMode="contain"
          height={100}
          width={100}
        />
      );
    }
    return (
      <>
        <View>
          <CameraSvg h={36} />
        </View>
        <Text className={'text-gray-600 text-xs'}>
          Click here to take a photo of what you want to be repaired
        </Text>
      </>
    );
  };

  const requestRepairMutation = useMutation({
    mutationKey: ['requestRepair'],
    mutationFn: async () => {
      const formData = new FormData();

      // Append fields to the FormData object
      formData.append('message', message);
      formData.append('attachmentFile', {
        uri: image?.uri,
        type: 'image/jpeg',
        name: image?.fileName,
      });

      return await HelpServices.requestRepair(formData);
    },
    onSuccess: () => {
      ToastAndroid.show('Repair request sent successfully', ToastAndroid.LONG);
      props?.handleCloseModal();
    },
    onError: () => {
      ToastAndroid.show('Error: Failed to request repair', ToastAndroid.LONG);
    },
  });

  const handleRequestRepair = () => {
    //   validate values
    if (!image?.uri) {
      return ToastAndroid.show('A photo is required.', ToastAndroid.LONG);
    }
    requestRepairMutation.mutate();
  };

  return (
    <CustomBottomSheet
      snapPoints={['70%', '70%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <ScrollView className={'px-4'}>
        <Text className={'text-xs font-inter text-grey_1 mb-2'}>
          Report or request for repair. The management will receive the
          notification.
        </Text>

        <View className={'flex-col items-start w-full py-3'}>
          <Text className={'text-black my-1.5 font-inter text-xs'}>
            What would you like to be repair ?
          </Text>
          <TextInput
            className={
              'text-black border border-border_grey w-full rounded-xl font-inter text-xs px-3'
            }
            numberOfLines={3}
            placeholder={'List of repairs'}
            placeholderTextColor={COLORS.border_grey}
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity
            className={
              'flex flex-col justify-center items-center h-40 bg-border_grey w-full rounded-xl my-3'
            }
            onPress={handleCamera}>
            {renderImage()}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CButton
        disabled={requestRepairMutation.isPending}
        ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
        onPress={handleRequestRepair}>
        <Text className={'text-white font-inter text-13 '}>
          {requestRepairMutation?.isPending ? 'saving...' : 'Submit'}
        </Text>
      </CButton>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View
    className={
      'top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-inter-semibold text-lg text-black'}>
      Request/Report Repair
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);
export default RequestRepair;
const styles = StyleSheet.create({
  textArea: {
    textAlignVertical: 'top',
  },
});
