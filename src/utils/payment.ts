import {Image} from 'react-native-compressor';
import * as ImagePicker from 'react-native-image-picker';

interface IImage {
  uri: string;
  name: string;
  type: string;
}

/**
 * Compress image before upload
 * @param img - Image to compress
 * @param setImages - Function to set images
 */
export const compressImage = async (
  img: ImagePicker.Asset,
  setImages: React.Dispatch<React.SetStateAction<IImage[] | IImage>>,
) => {
  if (!img?.uri) {
    return;
  }

  Image.compress(img?.uri, {
    quality: 0.9,
  }).then((cImg: string) => {
    setImages(prev => {
      // check if pre type is arrary
      if (Array.isArray(prev)) {
        return [
          ...prev,
          {uri: cImg, name: img.fileName ?? '', type: img.type ?? ''},
        ];
      }
      // if not array set as object
      return {uri: cImg, name: img.fileName ?? '', type: img.type ?? ''};
    });
  });
};
