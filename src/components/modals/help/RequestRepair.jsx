import React, {forwardRef, useState} from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import {CustomBottomSheet} from '../index';
import {CButton} from '../../general';
import {CloseSvg} from '@/assets/icons';
import COLORS from '../../../constants/Theme';
import {CameraSvg} from '../../../assets/icons';

const RequestRepair = forwardRef((props, ref) => {
  // saves image
  const [image, setImage] = useState(null);

  const handleCamera = async () => {
    const img = await launchCamera(
      {
        mediaType: 'photo',
        includeBase64: false,
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

  return (
    <CustomBottomSheet
      snapPoints={['20%', '60%']}
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
          <TouchableOpacity
            className={
              'flex flex-col justify-center items-center h-40 bg-border_grey w-full rounded-xl my-3'
            }
            onPress={handleCamera}>
            {renderImage()}
          </TouchableOpacity>

          <TextInput
            className={
              'text-black border border-border_grey w-full rounded-xl font-inter text-xs px-3'
            }
            numberOfLines={3}
            placeholder={'List of repairs'}
            placeholderTextColor={COLORS.border_grey}
            style={styles.textArea}
          />
        </View>
      </ScrollView>
      <CButton
        ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
        onPress={props.handleCloseModal}>
        <Text className={'text-white font-inter text-13 '}>Submit</Text>
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
