import React, {useMemo, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import LikeButton from '@/components/screens/property_view/like-button';
import {useActiveAgrement} from '@/hooks';
import {useNavigation} from '@react-navigation/native';
import MapView, {Marker} from 'react-native-maps';
import {
  BackSvg,
  BalconySvg,
  BathroomSvg,
  BedSvg,
  HouseMapMarker,
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
import MatterPortPreview from '../../components/screens/property_view/matterport-preview';
import COLORS from '../../constants/Theme';
import {
  usePropertyListing,
  useSpecificPropertyListing,
} from '../../hooks/usePropertyListing';
import Helper from '../../utils/Helper';
import numberWithCommas from '../../utils/numberWithCommas';
import {getFullListingWebUrl} from '@/utils';
import Share from 'react-native-share';
import {toast} from '../../utils/toast';

const ApartmentView = ({route: {params}}) => {
  const bottomSheetRef = useRef();
  const navigation = useNavigation();
  const {listings} = usePropertyListing();

  const [modalState, setModalState] = useState(false);

  const {isPending, data} = useSpecificPropertyListing(params?.apartment);

  const {agreement} = useActiveAgrement();

  const propertyContact = useMemo(
    () =>
      agreement?.phoneNumber ||
      agreement?.propertyUnits?.property?.propertyContacts?.phoneNumber,
    [agreement],
  );

  const listing = useMemo(() => {
    if (!isPending) {
      return data;
    }

    return null;
  }, [data, isPending]);

  const region = useMemo(
    () => ({
      latitude: listing?.property?.address?.latitude ?? -1.2881012218277417,
      longitude: listing?.property?.address?.longitude ?? 36.82609607136736,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }),
    [
      listing?.property?.address?.latitude,
      listing?.property?.address?.longitude,
    ],
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
    frameborder='0'8
    allowfullscreen
    src=${
      listing?.matterportUrl ||
      'https://tour.virtualaccess.co.ke/tours/YTI7Hk-iA'
    }
/>`;
  }, [listing?.matterportUrl]);

  const currentListing = useMemo(
    () => listings?.find(l => l.id === params?.apartment),
    [listings, params?.apartment],
  );

  const isRent = useMemo(() => {
    return listing?.purpose?.toLocaleLowerCase() === 'rent';
  }, [listing?.purpose]);

  const handleShare = async () => {
    try {
      const url = getFullListingWebUrl(params.apartment);
      await Share.open({
        title: 'Check out this property!',
        message: 'Check out this property on Keystone!',
        url,
      });
    } catch (error) {
      // Optionally handle user cancel or error
      if (error?.message !== 'User did not share') {
        toast.show(
          'Failed to share the listing. Please try again.',
          toast.LONG,
        );
      }
    }
  };

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
              <ExploreActionBtn
                onPress={handleShare}
                ClassName={'bg-white'}
                icon={<UploadSvg />}
              />

              <LikeButton
                className={
                  'relativep-2 bg-bg_grey rounded-full h-9 w-9 items-center justify-center'
                }
                data={currentListing}
                color={COLORS.white}
                strokeColor={COLORS.text_color}
                size="24"
                iconProps={{
                  size: 24,
                }}
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

          <Text className={'text-white text-11 font-open-sauce-sans'}>
            Virtual Tour
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* apartment primary details  */}
        <View className={'px-4 border-b border-border_grey'}>
          <Text className={'text-black font-open-sauce-sans-semibold mt-2'}>
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
          name={'Keystone'}
          unitName={listing?.unitName}
          phoneNumber={propertyContact}
          rent={listing?.rent?.toString()}
          userName={'Keystone'}
          isRent={isRent}
        />

        {/* Location details */}
        <View className={'px-4 py-6 border-b border-border_grey'}>
          <Text className={'text-sm font-open-sauce-sans-medium text-black'}>
            Where is the unit located
          </Text>

          <Text
            className={
              'text-grey_1 font-open-sauce-sans my-1.5 text-[13px] leading-6'
            }>
            {`${listing?.property?.address?.line}`}
          </Text>

          {listing?.property?.address?.latitude &&
          listing?.property?.address?.longitude ? (
            <View className={'h-32 my-3 bg-bg_grey'}>
              {!isPending && (
                <MapView className={'flex-1'} region={region}>
                  <Marker
                    coordinate={{
                      latitude: listing?.property?.address?.latitude,
                      longitude: listing?.property?.address?.longitude,
                    }}>
                    <HouseMapMarker />
                  </Marker>
                </MapView>
              )}
            </View>
          ) : null}

          {/* Virtual tour button */}
          <View className={'flex-row justify-center '}>
            <TouchableOpacity
              style={styles.virtualButton}
              onPress={handleViewTour}
              className={
                'flex-row py-3.5 px-6 border border-primary rounded-md items-center'
              }>
              <VirtualTourSvg color={COLORS.primary} />
              <Text className={'text-primary text-xs font-open-sauce-sans'}>
                Virtual Tour
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* amenities */}
        <View className={'px-4 py-5'}>
          <Text className={'text-black font-open-sauce-sans-medium'}>
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
        isRent={isRent}
        phoneNumber={propertyContact}
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
