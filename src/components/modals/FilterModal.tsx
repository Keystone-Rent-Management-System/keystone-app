import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacityProps,
  View,
} from 'react-native';
import React, {forwardRef, useCallback, useState} from 'react';

import {CustomBottomSheet} from '.';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {ApartmentSvg, RightArrowSvg, VillaSvg} from '../../assets/icons';
import CInput, {LabelledCInput} from '../general/input/CInput.tsx';
import COLORS from '../../constants/Theme';
import CRangeSlider from '../rangeSlider';
import {ExploreRoomSelector} from '..';
import HouseTypeItem from '../screens/explore/HouseTypeItem';
import {BottomSheetMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {
  MAX_PRICE_RANGE,
  MIN_PRICE_RANGE,
  STEP,
} from '../../constants/property.ts';
import {IFilters} from '../../types/property.ts';
import {useFiltersStore} from '../../provider/store/filters.ts';

interface FilterModalProps {
  handleCloseFilter: () => void;
}

const FilterModal = forwardRef<BottomSheetMethods, FilterModalProps>(
  (props, ref) => {
    const {addRemoveFilters} = useFiltersStore();

    const [isChecked, setIsChecked] = useState(false);

    const [chosenHouseType, setChosenHouseType] = useState<string | undefined>(
      undefined,
    );

    const [chosenHouseSize, setChosenHouseSize] = useState<string | undefined>(
      undefined,
    );
    const [chosenBedroomSize, setChosenBedroomSize] = useState<
      string | undefined
    >(undefined);

    const [lowNumber, setLowNumber] = useState<number>(MIN_PRICE_RANGE);
    const [highNumber, setHighNumber] = useState<number>(MAX_PRICE_RANGE);

    const handleLowChange = useCallback((value: string | number = '0') => {
      if (parseInt(value.toString(), 10) > 0) {
        setLowNumber(parseInt(value.toString(), 10));
      }
    }, []);

    const handleHighChange = useCallback((value: string | number = '0') => {
      if (parseInt(value.toString(), 10) > 0) {
        setHighNumber(parseInt(value.toString(), 10));
      }
    }, []);

    const handleSliderChange = useCallback(
      (low: number, high: number) => {
        handleHighChange(high);
        handleLowChange(low);
      },
      [handleHighChange, handleLowChange],
    );

    const handleHouseTypeChange = useCallback(
      (type: string) => {
        if (type === chosenHouseType) {
          setChosenHouseType(undefined);
        } else {
          setChosenHouseType(type);
        }
      },
      [chosenHouseType],
    );

    const handleHouseSizeChange = useCallback((size: string) => {
      const splitSections = size.split('_');
      const category = splitSections[0] ?? null;
      const _size = splitSections[1] ?? null;

      if (category && _size) {
        if (category === 'bedroom') {
          if (_size === '0') {
            setChosenBedroomSize(undefined);
          } else {
            setChosenBedroomSize(_size);
          }
        } else {
          if (_size === '0') {
            setChosenHouseSize(undefined);
          } else {
            setChosenHouseSize(_size);
          }
        }
      }
    }, []);

    const handleApplyFilter = useCallback(() => {
      const filters: IFilters = {};

      if (chosenBedroomSize) {
        filters.bedrooms = chosenBedroomSize;
      }
      if (chosenHouseSize) {
        filters.bedrooms = chosenHouseSize;
      }

      addRemoveFilters({
        houseType: chosenHouseType,
        bedrooms: chosenBedroomSize?.toString(),
        bathrooms: chosenHouseSize?.toString(),
        minPrice: lowNumber !== MIN_PRICE_RANGE ? lowNumber : undefined,
        maxPrice: highNumber !== MAX_PRICE_RANGE ? highNumber : undefined,
      });
      props.handleCloseFilter();
    }, [
      chosenBedroomSize,
      chosenHouseSize,
      addRemoveFilters,
      chosenHouseType,
      lowNumber,
      highNumber,
      props,
    ]);

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

        <Text className={'font-open-sauce-sans-semibold text-15 text-black'}>
          Filter
        </Text>

        <View className={'p-2 bg-none w-4'} />
      </View>
    );

    return (
      <CustomBottomSheet
        backgroundStyle={styles.container}
        snapPoints={['50%', '98%']}
        ref={ref}
        handleComponent={renderSheetHeader}
        containerStyle={styles.container2}>
        <View className={'flex-1 bg-none rounded-t-2xl overflow-hidden'}>
          <ScrollView style={styles.scrollView}>
            {/* Location input */}
            <LabelledCInput
              label={'Location'}
              ClassName={
                'border-border_grey rounded-lg font-open-sauce-sans px-2'
              }
              placeHolder={'Search Location'}
              placeholderTextColor={COLORS.border_grey}
              labelClassName={''}
            />

            {/* Seperator */}
            <View
              className={'my-5 h-1 w-full bg-none border-b border-border_grey'}
            />

            {/* Switch Input */}
            <LabelledCInput
              label={'Price Range'}
              value={'Include all charges required to move in'}
              ClassName={
                'border-border_grey rounded-lg font-open-sauce-sans px-2'
              }
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
            <CRangeSlider
              onValuesChange={handleSliderChange}
              minVal={MIN_PRICE_RANGE}
              maxVal={MAX_PRICE_RANGE}
              step={STEP}
            />

            {/* Range slider inputs */}
            <View className={'flex-row '}>
              <CInput
                placeHolder="Min Value"
                ClassName={'flex-1 border-border_grey px-2 py-0 h-11'}
                InputClassName={'text-xs'}
                defaultValue={lowNumber.toString()}
                // defaultValue={}
                onChangeText={handleLowChange}
              />

              <View className={'mx-2 border-b border-gray-700 w-6 my-auto'} />

              <CInput
                ClassName={'flex-1 border-border_grey px-2 py-0 h-11'}
                placeHolder="Max Value"
                InputClassName={'text-xs'}
                defaultValue={highNumber.toString()}
                onChangeText={handleHighChange}
              />
            </View>

            {/* Seperator */}
            <View
              className={'my-5 h-1 w-full bg-none border-b border-border_grey'}
            />

            {/* House size filters */}
            <Text className={'font-open-sauce-sans-medium text-black '}>
              House Size
            </Text>

            {houseFilters.map((filt, ind) => (
              <ExploreRoomSelector
                filter={filt}
                key={ind}
                handleActiveChange={handleHouseSizeChange}
              />
            ))}

            {/* Seperator */}
            <View
              className={'my-5 h-1 w-full bg-none border-b border-border_grey'}
            />

            {/* House type filters */}
            <Text className={'font-open-sauce-sans-medium text-black '}>
              House Type
            </Text>

            <View style={styles.houseItem} className={'flex-row mt-3'}>
              {houseTypes.map((item, index) => (
                <HouseTypeItem
                  key={index}
                  icon={item?.icon}
                  text={item?.text}
                  isCurrent={item?.text?.toLowerCase() === chosenHouseType}
                  handleChoose={() =>
                    handleHouseTypeChange(item?.text?.toLowerCase())
                  }
                />
              ))}
            </View>

            {/* Separator */}
            <View
              className={'my-5 h-1 w-full bg-none border-b border-border_grey'}
            />

            <SaveFiltersBtn onPress={handleApplyFilter} />

            <View className={'h-10'} />
          </ScrollView>
        </View>
      </CustomBottomSheet>
    );
  },
);

export default FilterModal;

const CSwitch = ({
  handleChange,
  isChecked,
}: {
  handleChange: (value: boolean) => void;
  isChecked: boolean;
}) => (
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
  container2: {
    zIndex: 1000,
    elevation: 20,
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
  {Bedroom: ['any', '1', '2', '3', '4', '5']},
  {Bathroom: ['any', '1', '2', '3', '4', '5']},
];

const houseTypes = [
  {
    icon: <ApartmentSvg />,
    text: 'Apartment',
    value: 'apartment',
  },
  {
    icon: <VillaSvg size={'30'} color={'black'} />,
    text: 'Villa',
    value: 'villa',
  },
];

interface ISaveFiltersBtnProps extends Partial<TouchableOpacityProps> {}

const SaveFiltersBtn = ({disabled, ...rest}: ISaveFiltersBtnProps) => (
  // @ts-ignore
  <TouchableOpacity
    className={`flex-row items-center h-12 justify-center border border-border_grey mr-3 py-1.5 px-4 rounded-full bg-primary ${
      disabled ? 'opacity-70' : ''
    }`}
    disabled={disabled}
    {...rest}>
    <Text className={'text-[15px] text-white font-open-sauce-sans-semibold'}>
      Apply filters
    </Text>
  </TouchableOpacity>
);
