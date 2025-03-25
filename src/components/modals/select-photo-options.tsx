import BottomSheet from '@gorhom/bottom-sheet';
import React, {forwardRef, useCallback} from 'react';
import {View} from 'react-native';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import {CloseSvg} from '../../assets/icons';
import {compressImage, IImage} from '../../utils/payment';
import {CButton} from '../general';
import CustomBottomSheet from './CustomBottomSheet';
import {SelectImageOption} from './components/select-image-option';

interface SelectPhotoOptionsProps {
  handleClose: () => void;
  setImage: React.Dispatch<React.SetStateAction<IImage[] | IImage>>;
  handleClear: () => void;
}

const SNAP_POINTS: (string | number)[] = ['30%', '30%'];
const IMAGE_PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  includeBase64: false,
};

const SelectPhotoOptions = forwardRef<BottomSheet, SelectPhotoOptionsProps>(
  ({handleClose, setImage, handleClear}, ref) => {
    const handleImageResponse = useCallback(
      (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorCode) {
          return;
        }

        const asset = response.assets?.[0];

        if (asset) {
          compressImage(asset, setImage);
        }
        handleClose();
      },
      [handleClose, setImage],
    );

    const handleLibrary = useCallback(async () => {
      try {
        const result = await launchImageLibrary(IMAGE_PICKER_OPTIONS);
        handleImageResponse(result);
      } catch (error) {
        console.error('Error selecting from library:', error);
      }
    }, [handleImageResponse]);

    const handleCamera = useCallback(async () => {
      try {
        const result = await launchCamera(IMAGE_PICKER_OPTIONS);
        console.log('result', result);
        handleImageResponse(result);
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }, [handleImageResponse]);

    const _handleClear = useCallback(() => {
      handleClear();
      handleClose();
    }, [handleClear, handleClose]);

    const renderSheetHeader = useCallback(
      () => <SheetHeader handleClose={handleClose} />,
      [handleClose],
    );

    return (
      <CustomBottomSheet
        ref={ref}
        snapPoints={SNAP_POINTS}
        handleComponent={renderSheetHeader}>
        <View className="px-5 flex-1">
          <SelectImageOption title="Take a photo" onPress={handleCamera} />
          <SelectImageOption
            title="Choose From Library"
            onPress={handleLibrary}
          />
          <SelectImageOption
            onPress={_handleClear}
            title="Clear"
            textClassName="text-red-600"
          />
        </View>
      </CustomBottomSheet>
    );
  },
);

const SheetHeader = ({handleClose}: {handleClose: () => void}) => (
  <View className="mx-5">
    <View className="bg-none pt-3 z-50 flex-row justify-between items-center">
      <CButton
        ClassName="rounded-full bg-none p-2 ml-auto"
        onPress={handleClose}>
        {/* @ts-ignore */}
        <CloseSvg size="18" />
      </CButton>
    </View>
  </View>
);

export default SelectPhotoOptions;
