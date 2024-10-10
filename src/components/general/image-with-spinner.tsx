import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  StyleSheet,
  View,
} from 'react-native';
import COLORS from '../../constants/Theme';

interface ImageWithSpinnerProps extends ImageProps {
  defaultUri?: string;
}

const ImageWithSpinner: React.FC<ImageWithSpinnerProps> = ({...props}) => {
  const [loading, setLoading] = useState(true);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      {loading && (
        <View
          className={
            'items-center justify-center absolute top-0 left-0 right-0 bottom-0 z-20 bg-white opacity-95'
          }>
          <ActivityIndicator size={25} color={COLORS.primary} />
        </View>
      )}
      <Image
        {...props}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageWithSpinner;
