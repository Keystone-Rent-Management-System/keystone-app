import React, {useMemo} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import listings from '@/provider/listings';
import {Layout} from '@/components';
import {BedSvg} from '@/assets/icons';
import Helper from '@/utils/Helper';
import {IconLabel} from '@/components/screens/explore/ListingItem';
import {
  BackSvg,
  BalconySvg,
  BathroomSvg,
  LikeSvg,
  MessageSvg,
  PhoneSvg,
  UploadSvg,
  VirtualTourSvg,
} from '../../assets/icons';
import COLORS from '../../constants/Theme';
import {ExploreAmenity} from '../../components';

const ApartmentView = ({route: {params}}) => {
  const currentApartmentDetails = useMemo(() => {
    return listings.find(item => item.id === params?.apartment);
  }, [params?.apartment]);

  return (
    <Layout>
      {/* image */}
      <View className={'h-60 relative'}>
        {/* floating action buttons */}
        <View
          className={
            'absolute inset-x-0 top-0 bg-none px-4 py-3 z-20 flex-row'
          }>
          <View className={'flex-1 flex-row'}>
            <ActionBtn
              ClassName={'bg-white h-9 w-9 items-center justify-center'}
              icon={<BackSvg size="16" />}
            />
          </View>

          <View
            style={styles.actionButtonWrapper}
            className={'flex-1 flex-row justify-end shadow-xl'}>
            <ActionBtn ClassName={'bg-white'} icon={<UploadSvg />} />
            <ActionBtn
              ClassName={'bg-white'}
              icon={<LikeSvg strokeColor={COLORS.text_color} size="24" />}
            />
          </View>
        </View>

        <Image
          source={{uri: currentApartmentDetails.image}}
          alt={'apartment'}
          className={'object-cover h-full'}
        />

        {/* virtual tour image */}
        <TouchableOpacity
          style={styles.floatingVirtualButton}
          className={
            'flex-row py-1.5 px-2 border-[0.4px] border-white rounded-md items-center absolute bottom-3 right-3'
          }>
          <VirtualTourSvg color={COLORS.white} />

          <Text className={'text-white text-11 font-inter'}>Virtual Tour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* apartment primary details  */}
        <View className={'p-4 border-b border-border_grey'}>
          <Text className={'text-black font-inter-semibold'}>
            {currentApartmentDetails?.title}
          </Text>

          <View className={'flex-row mt-2'}>
            {currentApartmentDetails.properties?.bedrooms > 0 && (
              <IconLabel
                icon={<BedSvg size={17} />}
                text={
                  currentApartmentDetails.properties?.bedrooms +
                  ` Bedroom${Helper.renderSingularPlural(
                    currentApartmentDetails.properties?.bedrooms,
                    's',
                  )}`
                }
              />
            )}

            {currentApartmentDetails.properties?.bedrooms > 0 && (
              <IconLabel
                icon={<BathroomSvg />}
                text={
                  currentApartmentDetails?.properties?.bathrooms + 'Bathroom'
                }
              />
            )}

            {currentApartmentDetails.properties?.balconies > 0 && (
              <IconLabel
                icon={<BalconySvg />}
                text={
                  currentApartmentDetails.properties?.balconies +
                  ` Balcon${Helper.renderSingularPlural(
                    currentApartmentDetails.properties?.bathrooms,
                    'ies',
                    'y',
                  )}`
                }
              />
            )}
          </View>
        </View>

        {/*  landlord details  */}
        <View className={'p-4 border-b border-border_grey flex-row'}>
          <ProfileView
            image={
              'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'
            }
          />

          <View className={'mx-3 flex-1'}>
            <Text className={'font-inter text-black'}>Tom Cruise</Text>
            <Text className={'font-inter capitalize text-13 text-grey_1'}>
              {currentApartmentDetails?.user}
            </Text>
          </View>

          <View
            className={'flex-row items-center'}
            style={styles.actionButtonWrapper}>
            {/* message button */}
            <ActionBtn icon={<MessageSvg />} />

            {/* call button */}
            <ActionBtn icon={<PhoneSvg />} />
          </View>
        </View>

        {/* Location details */}
        <View className={'px-4 py-6 border-b border-border_grey'}>
          <Text className={'text-sm font-inter-medium text-black'}>
            Where is the unit located
          </Text>

          <Text className={'text-grey_1 font-inter my-1.5'}>
            {currentApartmentDetails.location}
          </Text>

          <View className={'h-32 my-3 bg-bg_grey'}>
            <View />
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
            {Object.keys(currentApartmentDetails.charges)?.map(
              (charge, ind) => (
                <ExploreAmenity
                  key={ind}
                  showCheckBox={false}
                  icon={currentApartmentDetails.charges[charge]?.icon}
                  title={charge}
                  value={`KES. ${currentApartmentDetails.charges[charge]?.amount}`}
                />
              ),
            )}
          </View>
        </View>

        {/* amenities */}
        <View className={'px-4 py-5'}>
          <Text className={'text-black font-inter-medium'}>
            Amenities Available
          </Text>

          <View className={'mt-3'} style={styles.chargeList}>
            {currentApartmentDetails.amenities?.map((amenity, ind) => (
              <ExploreAmenity
                key={ind}
                showCheckBox={false}
                icon={amenity.icon}
                title={amenity.text}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const ProfileView = ({image}) => (
  <Image
    className={'h-12 w-12 rounded-full'}
    source={{
      uri: image,
    }}
    alt="profile"
  />
);

const ActionBtn = ({icon, handlePress, ClassName}) => (
  <TouchableOpacity
    className={`p-2 bg-bg_grey rounded-full h-9 w-9 items-center justify-center ${ClassName}`}
    onPress={handlePress}>
    {icon}
  </TouchableOpacity>
);

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
