import React, {useMemo, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BackSvg,
  BalconySvg,
  BathroomSvg,
  BedSvg,
  HouseMapMarker,
  LikeSvg,
  UploadSvg,
  VirtualTourSvg,
} from '../../assets/icons';
import {
  ApartmentViewFloatingActionBar,
  ExploreActionBtn,
  ExploreAmenity,
  LandlordItem,
  Layout,
} from '../../components';
import {VirtualTourModal} from '../../components/modals';
import {IconLabel} from '../../components/screens/explore/ListingItem';
import COLORS from '../../constants/Theme';
import Helper from '../../utils/Helper';
import {useNavigation} from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import {PALLAX_PHONE_NUMBER} from '../../constants';
import {useSpecificPropertyListing} from '../../hooks/usePropertyListing';
import numberWithCommas from '../../utils/numberWithCommas';
import MatterPortPreview from '../../components/screens/property_view/matterport-preview';

const ApartmentView = ({route: {params}}) => {
  const bottomSheetRef = useRef();
  const navigation = useNavigation();

  const [modalState, setModalState] = useState(false);

  const {isPending, data} = useSpecificPropertyListing(params?.apartment);

  const listing = useMemo(() => {
    if (!isPending) {
      return data;
    }

    return null;
  }, [data, isPending]);

  const region = useMemo(
    () => ({
      latitude: listing?.property?.latitude ?? -1.2881012218277417,
      longitude: listing?.property?.longitude ?? 36.82609607136736,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }),
    [listing?.property?.latitude, listing?.property?.longitude],
  );

  const handleViewTour = () => {
    // setModalState(true);
    bottomSheetRef.current?.expand();
  };

  const handleCloseTour = () => {
    bottomSheetRef.current?.close();
  };

  const handleSheetChanges = changes => {
    if (changes < 0) {
      setModalState(false);
    } else {
      if (!modalState) {
        setModalState(true);
      }
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const htmlIframe = useMemo(() => {
    return `<iframe
    width="100%"
    height="100%"
    frameborder='0'
    allowfullscreen
    src=${
      listing?.matterportUrl ||
      'https://tour.virtualaccess.co.ke/tours/YTI7Hk-iA'
    }
/>`;
  }, [listing?.matterportUrl]);

  return (
    <Layout>
      {/* image */}
      <View className={'h-60 relative'}>
        {/* floating action buttons */}
        {!modalState && (
          <View
            className={
              'absolute inset-x-0 top-0 bg-none px-4 py-3 z-20 flex-row '
            }>
            <View className={'flex-1 flex-row'}>
              <ExploreActionBtn
                ClassName={'bg-white h-9 w-9 items-center justify-center'}
                icon={<BackSvg size="16" />}
                handlePress={handleGoBack}
              />
            </View>

            <View
              style={styles.actionButtonWrapper}
              className={'flex-1 flex-row justify-end shadow-xl'}>
              <ExploreActionBtn ClassName={'bg-white'} icon={<UploadSvg />} />
              <ExploreActionBtn
                ClassName={'bg-white'}
                icon={<LikeSvg strokeColor={COLORS.text_color} size="24" />}
              />
            </View>
          </View>
        )}

        {/*<ImageSlider images={imgs} />*/}
        <MatterPortPreview htmlIframe={htmlIframe} />

        {/* virtual tour image */}
        <TouchableOpacity
          style={styles.floatingVirtualButton}
          className={
            'flex-row  py-1.5 px-2 border-[0.4px] border-white rounded-md items-center absolute bottom-8 right-3'
          }
          onPress={handleViewTour}>
          <VirtualTourSvg color={COLORS.white} />

          <Text className={'text-white text-11 font-inter'}>Virtual Tour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* apartment primary details  */}
        <View className={'px-4 border-b border-border_grey'}>
          <Text className={'text-black font-inter-semibold mt-2'}>
            {listing?.property.name}
          </Text>

          <View className={'flex-row py-2'}>
            {listing?.numberOfBedrooms > 0 && (
              <IconLabel
                icon={<BedSvg size={17} />}
                text={
                  listing?.numberOfBedrooms +
                  ` Bedroom${Helper.renderSingularPlural(
                    listing?.numberOfBedrooms,
                    's',
                  )}`
                }
              />
            )}

            {listing?.numberOfBathrooms > 0 && (
              <IconLabel
                icon={<BathroomSvg />}
                text={
                  listing?.numberOfBathrooms +
                  ` Bathroom${Helper.renderSingularPlural(
                    listing?.numberOfBathrooms,
                    's',
                  )}`
                }
              />
            )}

            {listing?.balcony > 0 && (
              <IconLabel
                icon={<BalconySvg />}
                text={
                  listing?.balcony +
                  ` Balcon${Helper.renderSingularPlural(
                    listing?.balcony,
                    'ies',
                    'y',
                  )}`
                }
              />
            )}
          </View>
        </View>

        <LandlordItem
          name={'Pallax'}
          unitName={listing?.unitName}
          phoneNumber={PALLAX_PHONE_NUMBER}
          rent={listing?.rent?.toString()}
          userName={'Pallax'}
        />

        {/* Location details */}
        <View className={'px-4 py-6 border-b border-border_grey'}>
          <Text className={'text-sm font-inter-medium text-black'}>
            Where is the unit located
          </Text>

          <Text
            className={'text-grey_1 font-inter my-1.5 text-[13px] leading-6'}>
            {`${listing?.property?.address?.line}`}
          </Text>

          {!!listing?.property?.latitude && (
            <View className={'h-32 my-3 bg-bg_grey'}>
              {!isPending && (
                <MapView className={'flex-1'} region={region}>
                  <Marker
                    coordinate={{
                      latitude: listing?.property?.latitude,
                      longitude: listing?.property?.longitude,
                    }}>
                    <HouseMapMarker />
                  </Marker>
                </MapView>
              )}
            </View>
          )}

          {/* Virtual tour button */}
          <View className={'flex-row justify-center '}>
            <TouchableOpacity
              style={styles.virtualButton}
              onPress={handleViewTour}
              className={
                'flex-row py-3.5 px-6 border border-primary rounded-md items-center'
              }>
              <VirtualTourSvg color={COLORS.primary} />
              <Text className={'text-primary text-xs font-inter'}>
                Virtual Tour
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* amenities */}
        <View className={'px-4 py-5'}>
          <Text className={'text-black font-inter-medium'}>
            Amenities Available
          </Text>

          <View className={'mt-3'} style={styles.chargeList}>
            {listing?.property?.amenities?.map((amenity, ind) => (
              <ExploreAmenity
                key={ind}
                showCheckBox={false}
                title={amenity?.name}
              />
            ))}
          </View>

          {/* custom modal */}
        </View>

        <View className={'h-16'} />
      </ScrollView>

      <ApartmentViewFloatingActionBar
        amount={numberWithCommas(Number(listing?.rent + listing?.deposit))}
      />

      <VirtualTourModal
        ref={bottomSheetRef}
        handleSheetChanges={handleSheetChanges}
        handleCloseTour={handleCloseTour}
        htmlIframe={htmlIframe}
      />
    </Layout>
  );
};

export default ApartmentView;

const styles = StyleSheet.create({
  actionButtonWrapper: {
    gap: 15,
  },
  virtualButton: {
    gap: 6,
  },
  chargeList: {
    gap: 12,
  },
  floatingVirtualButton: {
    backgroundColor: COLORS.primary + '60',
    gap: 8,
  },
  webview: {
    height: 300,
    width: '100%',
    backgroundColor: 'transparent',
  },
});
