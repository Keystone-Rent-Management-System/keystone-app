import React, {useMemo, useRef, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import listings from '@/provider/listings';
import Helper from '@/utils/Helper';
import {IconLabel} from '@/components/screens/explore/ListingItem';
import {
  BackSvg,
  BalconySvg,
  BathroomSvg,
  BedSvg,
  LikeSvg,
  UploadSvg,
  VirtualTourSvg,
} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {
  ApartmentViewFloatingActionBar,
  ExploreActionBtn,
  ExploreAmenity,
  Layout,
} from '@/components';
import {useNavigation} from '@react-navigation/native';
import {VirtualTourModal} from '@/components/modals';
import {LandlordItem} from '../../components';
import {useSpecificPropertyListing} from '../../hooks/usePropertyListing';

const ApartmentView = ({route: {params}}) => {
  const bottomSheetRef = useRef();
  const navigation = useNavigation();

  const [modalState, setModalState] = useState(false);

  const {listing} = useSpecificPropertyListing(params?.apartment);

  const currentApartmentDetails = useMemo(() => {
    return listings.find(item => item.id === params?.apartment);
  }, [params?.apartment]);

  // const region = useMemo(
  //   () => ({
  //     latitude:
  //       currentApartmentDetails?.coordinates?.latitude ?? -1.2881012218277417,
  //     longitude:
  //       currentApartmentDetails?.coordinates?.longitude ?? 36.82609607136736,
  //     latitudeDelta: 0.015,
  //     longitudeDelta: 0.015,
  //   }),
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [],
  // );

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

  console.log('LISTING:', listing?.property);

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

        <Image
          source={{uri: listing?.matterportUrl}}
          alt={'apartment'}
          className={'object-cover h-full'}
        />

        {/* virtual tour image */}
        <TouchableOpacity
          style={styles.floatingVirtualButton}
          className={
            'flex-row py-1.5 px-2 border-[0.4px] border-white rounded-md items-center absolute bottom-3 right-3'
          }
          onPress={handleViewTour}>
          <VirtualTourSvg color={COLORS.white} />

          <Text className={'text-white text-11 font-inter'}>Virtual Tour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* apartment primary details  */}
        <View className={'p-4 border-b border-border_grey'}>
          <Text className={'text-black font-inter-semibold'}>
            {listing?.unitName}
          </Text>

          <View className={'flex-row mt-2'}>
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
                  listing?.numberOfBathrooms +
                  ` Balcon${Helper.renderSingularPlural(
                    listing?.numberOfBathrooms,
                    'ies',
                    'y',
                  )}`
                }
              />
            )}
          </View>
        </View>

        <LandlordItem
          unitName={listing?.unitName}
          phoneNumber={listing?.property?.propertyContacts?.phoneNumber}
          userName={listing?.property?.propertyContacts?.contactName}
        />

        {/* Location details */}
        <View className={'px-4 py-6 border-b border-border_grey'}>
          <Text className={'text-sm font-inter-medium text-black'}>
            Where is the unit located
          </Text>

          <Text className={'text-grey_1 font-inter my-1.5'}>
            {`${listing?.property?.country}, ${listing?.property?.county}, ${listing?.property?.neighborhood}`}
          </Text>

          <View className={'h-32 my-3 bg-bg_grey'}>
            {/* <MapView className={'flex-1'} region={region}>
              <Marker coordinate={region}>
                <HouseMapMarker />
              </Marker>
            </MapView> */}
          </View>

          {/* Virtual tour button */}
          <View className={'flex-row justify-center '}>
            <TouchableOpacity
              style={styles.virtualButton}
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

        {/* Charges */}
        <View className={'px-4 py-5 border-b border-border_grey'}>
          <Text className={'text-black font-inter-medium'}>Charges</Text>

          <View className={'mt-3'} style={styles.chargeList}>
            {/* {Object?.keys(currentApartmentDetails?.charges)?.map(
              (charge, ind) => (
                <ExploreAmenity
                  key={ind}
                  showCheckBox={false}
                  icon={currentApartmentDetails?.charges[charge]?.icon}
                  title={charge}
                  value={`KES. ${currentApartmentDetails?.charges[charge]?.amount}`}
                />
              ),
            )} */}
          </View>
        </View>

        {/* amenities */}
        <View className={'px-4 py-5'}>
          <Text className={'text-black font-inter-medium'}>
            Amenities Available
          </Text>

          <View className={'mt-3'} style={styles.chargeList}>
            {listing?.amenities?.map((amenity, ind) => (
              <ExploreAmenity
                key={ind}
                showCheckBox={false}
                icon={amenity.icon}
                title={amenity}
              />
            ))}
          </View>

          {/* custom modal */}
        </View>

        <View className={'h-16'} />
      </ScrollView>

      <ApartmentViewFloatingActionBar amount={listing?.rent} />

      <VirtualTourModal
        ref={bottomSheetRef}
        handleSheetChanges={handleSheetChanges}
        handleCloseTour={handleCloseTour}
        source={{uri: currentApartmentDetails?.matterportUrl}}
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
});
