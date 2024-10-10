import * as React from 'react';
import {Dimensions, Pressable, View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import ImageWithSpinner from '../../../components/general/image-with-spinner';
import COLORS from '../../../constants/Theme';

const window = Dimensions.get('window');

const PAGE_WIDTH = window.width;

interface IPropertyImages {
  images: string[]; // array of image links
}

const PropertyImages = ({images}: IPropertyImages) => {
  const progress = useSharedValue<number>(0);
  const baseOptions = {
    vertical: false,
    width: PAGE_WIDTH,
    height: PAGE_WIDTH * 0.6,
  } as const;

  const ref = React.useRef<ICarouselInstance>(null);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <View
      className={'relative'}
      style={{
        alignItems: 'center',
      }}>
      <View className={'h- w-full pb-10 h-full'}>
        <Carousel
          ref={ref}
          {...baseOptions}
          loop
          pagingEnabled
          autoPlayInterval={5000}
          autoPlay
          onProgressChange={progress}
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          data={images}
          renderItem={({item}: {item: any}) => (
            <Pressable className={'overflow-hidden bg-white border-0 w-full'}>
              <ImageWithSpinner
                className={'w-full h-60'}
                source={
                  item === 'default'
                    ? require('../../../assets/images/shot-panoramic-composition-bedroom.jpg')
                    : {uri: item}
                }
                style={{resizeMode: 'cover'}}
              />
            </Pressable>
          )}
        />
      </View>

      <View className={'absolute inset-x-0 bottom-20 flex-row justify-center'}>
        <Pagination.Basic<{img: string}>
          progress={progress}
          data={images.map(img => ({img}))}
          size={13}
          dotStyle={{
            borderRadius: 100,
            backgroundColor: '#fff',
          }}
          activeDotStyle={{
            borderRadius: 100,
            overflow: 'hidden',
            backgroundColor: COLORS.primary,
          }}
          containerStyle={[
            {
              gap: 8,
              bottom: 0,
            },
          ]}
          horizontal
          renderItem={item => (
            <View
              style={{
                backgroundColor: item.img,
                flex: 1,
              }}
            />
          )}
          onPress={onPressPagination}
        />
      </View>
    </View>
  );
};

export default PropertyImages;
