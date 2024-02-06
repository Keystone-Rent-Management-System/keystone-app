import {ScrollView, StyleSheet, Switch, Text, View} from 'react-native';
import React, {forwardRef, useState} from 'react';

import {CustomBottomSheet} from '.';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {RightArrowSvg} from '@/assets/icons';
import CInput, {LabelledCInput} from '../general/CInput';
import COLORS from '@/constants/Theme';
import CRangeSlider from '../rangeSlider';
import {ExploreAmenity, ExploreRoomSelector} from '..';
import {
  ApartmentSvg,
  BabyCareSvg,
  CarSvg,
  GymSvg,
  SecuritySvg,
  SwimmingPoolSvg,
  VillaSvg,
  WaterAvailableSvg,
  WifiSvg,
} from '../../assets/icons';
import HouseTypeItem from '../screens/explore/HouseTypeItem';
import {SelectorButton} from '../screens/explore/RoomSelector';

/**
 * @type {{
 *  handleCloseFilter:Function
 * }} props
 */

const FilterModal = forwardRef((props, ref) => {
  const [isChecked, setIsChecked] = useState(false);
  const [chosenManagement, setChosenManagement] = useState('any');
  const [chosenHouseType, setChosenHouseType] = useState('');

  const renderSheetHeader = () => (
    <View
      className={
        'p-3 px-5 border-b border-border_grey flex-row justify-between items-center'
      }>
      <TouchableOpacity
        className={
          'rotate-180 rounded-full border border-border_grey h-8 w-8 flex justify-center items-center'
        }
        onPress={props.handleCloseFilter}>
        <RightArrowSvg size={'18'} />
      </TouchableOpacity>

      <Text className={'font-inter-semibold text-15 text-black'}>Filter</Text>

      <View className={'p-2 bg-none w-4'} />
    </View>
  );

  return (
    <CustomBottomSheet
      backgroundStyle={styles.container}
      snapPoints={['50%', '98%']}
      ref={ref}
      handleComponent={renderSheetHeader}>
      <View className={'flex-1 bg-none rounded-t-2xl overflow-hidden'}>
        <ScrollView style={styles.scrollView}>
          {/* Location input */}
          <LabelledCInput
            label={'Location'}
            ClassName={'border-border_grey rounded-lg font-inter px-2'}
            placeHolder={'Search Location'}
            placeholderTextColor={COLORS.border_grey}
          />

          {/* Seperator */}
          <View
            className={'my-5 h-1 w-full bg-none border-b border-border_grey'}
          />

          {/* Switch Input */}
          <LabelledCInput
            label={'Price Range'}
            value={'Include all charges required to move in'}
            ClassName={'border-border_grey rounded-lg font-inter px-2'}
            InputClassName={'text-xs'}
            placeHolder={'Search Location'}
            placeholderTextColor={COLORS.border_grey}
            editable={false}
            rightElement={
              <CSwitch
                isChecked={isChecked}
                handleChange={val => setIsChecked(val)}
              />
            }
          />

          {/* Range slider */}
          <CRangeSlider />

          {/* Range slider inputs */}
          <View className={'flex-row '}>
            <CInput
              placeHolder="Min Value"
              ClassName={'flex-1 border-border_grey px-2 py-0 h-11'}
              InputClassName={'text-xs'}
            />

            <View className={'mx-2 border-b border-gray-700 w-6 my-auto'} />

            <CInput
              ClassName={'flex-1 border-border_grey px-2 py-0 h-11'}
              placeHolder="Max Value"
              InputClassName={'text-xs'}
            />
          </View>

          {/* Seperator */}
          <View
            className={'my-5 h-1 w-full bg-none border-b border-border_grey'}
          />

          {/* House size filters */}
          <Text className={'font-inter-medium text-black '}>House Size</Text>

          {houseFilters.map((filt, ind) => (
            <ExploreRoomSelector filter={filt} key={ind} />
          ))}

          {/* Seperator */}
          <View
            className={'my-5 h-1 w-full bg-none border-b border-border_grey'}
          />

          {/* Amenities */}
          <Text className={'font-inter-medium text-black mb-1'}>Amenities</Text>

          {amenityFilters.map((item, key) => (
            <ExploreAmenity key={key} icon={item.icon} title={item.text} />
          ))}

          {/* Seperator */}
          <View
            className={'my-5 h-1 w-full bg-none border-b border-border_grey'}
          />

          {/* House type filters */}
          <Text className={'font-inter-medium text-black '}>House Type</Text>

          <View style={styles.houseItem} className={'flex-row mt-3'}>
            {houseTypes.map((item, index) => (
              <HouseTypeItem
                key={index}
                icon={item?.icon}
                text={item?.text}
                isCurrent={item?.text?.toLowerCase() === chosenHouseType}
                handleChoose={() =>
                  setChosenHouseType(item?.text?.toLowerCase())
                }
              />
            ))}
          </View>

          {/* Separator */}
          <View
            className={'my-5 h-1 w-full bg-none border-b border-border_grey'}
          />

          {/* House type filters */}
          <Text className={'font-inter-medium text-black mt-3'}>
            Management
          </Text>
          <Text className={'font-inter-medium text-grey_1 text-xs my-1'}>
            Who manages the house?
          </Text>

          <View style={styles.houseManagement} className={'flex-row my-2'}>
            {houseManagement?.map((item, ind) => (
              <SelectorButton
                isActive={chosenManagement === item.toLowerCase()}
                handlePress={() => setChosenManagement(item.toLowerCase())}
                key={ind}
                text={item}
              />
            ))}
          </View>

          <View className={'w-full h-10 '} />
        </ScrollView>
      </View>
    </CustomBottomSheet>
  );
});

export default FilterModal;

const CSwitch = ({handleChange, isChecked}) => (
  <View className={' my-auto'}>
    <Switch
      trackColor={{
        false: COLORS.inactive_text,
        true: COLORS.primary,
      }}
      thumbColor={'#fff'}
      value={isChecked}
      onValueChange={handleChange}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  scrollView: {
    padding: 20,
  },
  houseItem: {
    gap: 15,
  },
  houseManagement: {
    gap: 8,
  },
});

const houseFilters = [
  {Balcony: ['any', '1', '2', '3', '4', '5']},
  {Bathroom: ['any', '1', '2', '3', '4', '5']},
  {Balcony: ['any', '1', '2', '3', '4', '5']},
];

const amenityFilters = [
  {
    icon: <WaterAvailableSvg />,
    text: 'Available Water 24/7',
  },
  {
    icon: <WifiSvg />,
    text: 'Wifi',
  },
  {
    icon: <CarSvg />,
    text: 'Parking',
  },
  {
    icon: <SecuritySvg />,
    text: 'Security',
  },
  {
    icon: <GymSvg />,
    text: 'Gym',
  },
  {
    icon: <SwimmingPoolSvg />,
    text: 'Swimming Pool',
  },
  {
    icon: <BabyCareSvg />,
    text: 'Baby Care',
  },
];

const houseTypes = [
  {
    icon: <ApartmentSvg />,
    text: 'Apartment',
  },
  {
    icon: <VillaSvg size={'30'} color={'black'} />,
    text: 'Villa',
  },
];

const houseManagement = ['Any', 'Agent', 'Landlord'];
