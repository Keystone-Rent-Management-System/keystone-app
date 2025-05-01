import React, {forwardRef, useCallback, useRef, useState} from 'react';

import {CloseSvg} from '@/assets/icons';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useMutation} from '@tanstack/react-query';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {CameraSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import HelpServices from '../../../services/help';
import {CButton} from '../../general';
import {CustomBottomSheet} from '../index';
import SelectPhotoOptions from '../select-photo-options';

const RequestRepair = forwardRef((props, ref) => {
  // saves image
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const selectImageRef = useRef(null);

  const handleOpenImageModal = () => {
    selectImageRef.current?.expand();
  };

  const handleCloseImageModal = () => {
    selectImageRef.current?.close();
  };

  const handleClear = useCallback(() => {
    setImage(null);
  }, []);

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
    <>
      <CustomBottomSheet
        snapPoints={['70%', '70%']}
        ref={ref}
        handleComponent={() => renderSheetHeader(props.handleCloseModal)}
        onChange={props.handleSheetChanges}>
        <BottomSheetScrollView className={'flex-1'}>
          <View className="px-4 min-h-[180px]">
            <Text className={'text-xs font-open-sauce-sans text-grey_1 mb-2'}>
              Report or request for repair. The management will receive the
              notification.
            </Text>

            <View className={'flex-col items-start w-full py-3'}>
              <Text
                className={'text-black my-1.5 font-open-sauce-sans text-xs'}>
                What would you like to be repair ?
              </Text>
              <TextInput
                className={
                  'text-black border border-border_grey w-full rounded-xl font-open-sauce-sans text-xs px-3'
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
                onPress={handleOpenImageModal}>
                {renderImage()}
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetScrollView>
        <CButton
          disabled={requestRepairMutation.isPending}
          ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
          onPress={handleRequestRepair}>
          <Text className={'text-white font-open-sauce-sans text-13 '}>
            {requestRepairMutation?.isPending ? 'saving...' : 'Submit'}
          </Text>
        </CButton>
      </CustomBottomSheet>

      <SelectPhotoOptions
        ref={selectImageRef}
        handleClose={handleCloseImageModal}
        setImage={setImage}
        handleClear={handleClear}
      />
    </>
  );
});

const renderSheetHeader = handleClose => (
  <View
    className={
      'top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-open-sauce-sans-semibold text-lg text-black'}>
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
