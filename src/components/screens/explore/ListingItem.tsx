import React, {useMemo} from 'react';

import {
  AgentSvg,
  BalconySvg,
  BathroomSvg,
  BedSvg,
  MapPinSvg,
} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {IProperty} from '@/types/property';
import Helper from '@/utils/Helper';
import {styled} from 'nativewind';
import {Pressable, Text, TouchableOpacity, View} from 'react-native';
import {RightArrowSvg} from '../../../assets/icons';
import numberWithCommas from '../../../utils/numberWithCommas';
import ImageWithSpinner from '../../general/image-with-spinner';
import LikeButton from '../property_view/like-button';
import Badge from './Badge';

interface ListingItemProps extends IProperty {
  imgClassName?: string;
  containerClassName?: string;
  textContainerClassName?: string;
  showBack?: boolean;
  image?: string;

  handlePress: () => void;
  handleClose?: () => void;
}

const ListingItem = ({
  imgClassName = 'h-60',
  containerClassName = 'mb-5',
  textContainerClassName = 'px-0',
  showBack = false,
  handlePress,
  handleClose,
  ...props
}: ListingItemProps) => {
  const StyledView = styled(View);

  const fullAddress = useMemo(() => compileFullAddress(props), [props]);

  return (
    <Pressable className={`mx-1 ${containerClassName}`} onPress={handlePress}>
      {/*  image   */}
      <StyledView className={'bg-bg shadow-xl rounded-xl relative'}>
        <ImageWithSpinner
          className={`w-full rounded-xl ${imgClassName}`}
          source={
            props.image
              ? {uri: props.image}
              : require('../../../assets/images/shot-panoramic-composition-bedroom.jpg')
          }
          alt={'property_img'}
        />
        {showBack && (
          <TouchableOpacity
            hitSlop={{top: 20, bottom: 20, left: 20}}
            onPress={handleClose}
            className={
              'absolute z-10 top-2 left-2 -rotate-180 bg-white p-1.5 rounded-full'
            }>
            <RightArrowSvg
              // color={liked ? COLORS.white : COLORS.text_color}
              // opacity={liked ? '1' : '0.45'}
              size={'18'}
            />
          </TouchableOpacity>
        )}

        <LikeButton
          hitSlop={{top: 20, bottom: 20, right: 20}}
          className="absolute z-10 top-2 right-2"
          data={props}
        />
      </StyledView>

      {/*details*/}
      <View className={`py-2 flex-col space-y-1 ${textContainerClassName}`}>
        {/*  title & user type*/}
        <View className={'flex-row justify-between'}>
          <Text
            style={{color: COLORS.text_color}}
            className={'font-open-sauce-sans-semibold'}>
            {props.name}
          </Text>

          <Badge ClassName={'flex-row bg-c_green_bg space-x-1'}>
            <AgentSvg />

            <Text className={'font-open-sauce-sans text-2xs text-c_green'}>
              __
            </Text>
          </Badge>
        </View>

        {/*  address  */}
        <View className={'flex-row mb-2'}>
          <IconLabel
            icon={<MapPinSvg />}
            text={fullAddress}
            textClassName="capitalize"
          />
        </View>

        {/*  bedrooms, bathrooms, balconies*/}
        <View className={'flex-row '}>
          {props.numberOfBedrooms > 0 && (
            <IconLabel
              icon={<BedSvg size={17} />}
              text={
                props.numberOfBedrooms +
                ` Bedroom${Helper.renderSingularPlural(
                  props.numberOfBedrooms,
                  's',
                )}`
              }
            />
          )}
          {props.numberOfBathrooms > 0 && (
            <IconLabel
              icon={<BathroomSvg />}
              text={
                props.numberOfBathrooms +
                ` Bathroom${Helper.renderSingularPlural(
                  props.numberOfBathrooms,
                  's',
                )}`
              }
            />
          )}
          {props.balcony > 0 && (
            <IconLabel
              icon={<BalconySvg />}
              text={
                props.balcony +
                ` Balcon${Helper.renderSingularPlural(
                  props.numberOfBathrooms,
                  'ies',
                  'y',
                )}`
              }
            />
          )}
        </View>

        {/*  price  */}
        <View className={'pt-2.5'}>
          <Text
            style={{color: COLORS.text_color}}
            className={'font-open-sauce-sans-semibold text-xs'}>
            KES. {numberWithCommas(Number(props.rent))}
            {props?.purpose?.toLocaleLowerCase() === 'rent' && (
              <Text className={'text-11 text-grey_1 font-open-sauce-sans'}>
                / Month
              </Text>
            )}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default ListingItem;

export const IconLabel = ({
  icon,
  text,
  textClassName = '',
}: {
  icon: React.ReactNode;
  text: string;
  textClassName?: string;
}) => (
  <View className={'flex-row space-x-2 mr-3'}>
    {icon}

    <Text
      className={`font-open-sauce-sans text-grey_1 text-xs ${textClassName}`}>
      {text}
    </Text>
  </View>
);

/**
 * @typedef {
 *   image:string,
 *   title:string,
 *   userType:string,
 *   category:string,
 *   location:string,
 *   price:string,
 *   balconies:number,
 *   bedrooms:number,
 *   bathrooms:number,
 *   id:string
 *   handlePress:Function
 *   data?:Object
 *   purpose?:string
 * } ListingProperty
 */

export const compileFullAddress = (item: IProperty) =>
  `${item?.country || '__'}, ${item?.county || '__'}, ${
    item?.location || '__'
  }`;
