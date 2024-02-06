import React, {useState} from 'react';

import {Image, Pressable, Text, TouchableOpacity, View} from 'react-native';
import COLORS from '@/constants/Theme';
import {styled} from 'nativewind';
import Badge from './Badge';
import {
  AgentSvg,
  BalconySvg,
  BathroomSvg,
  BedSvg,
  LikeSvg,
  MapPinSvg,
} from '@/assets/icons';
import Helper from '@/utils/Helper';

/**
 * Returns property item for listing
 * @param {ListingProperty} props
 * @returns {Element}
 * @constructor
 */
const ListingItem = props => {
  const StyledView = styled(View);
  const [liked, setLiked] = useState(false);

  const handleLike = () => setLiked(prev => !prev);

  return (
    <Pressable className={'mb-5 mx-1'} onPress={props.handlePress}>
      {/*  image   */}
      <StyledView className={'bg-bg shadow-xl rounded-xl relative'}>
        <Image
          className={'w-full h-60 rounded-xl'}
          source={{uri: props.image}}
          alt={'property_img'}
        />

        {/*  like button  */}
        <TouchableOpacity
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
          onPress={handleLike}
          className={'absolute z-10 top-2 right-2'}>
          <LikeSvg
            color={liked ? COLORS.white : COLORS.text_color}
            opacity={liked ? '1' : '0.45'}
          />
        </TouchableOpacity>
      </StyledView>

      {/*details*/}
      <View className={'py-2 flex-col space-y-1'}>
        {/*  title & user type*/}
        <View className={'flex-row justify-between'}>
          <Text
            style={{color: COLORS.text_color}}
            className={'font-inter-semibold'}>
            {props.title}
          </Text>

          <Badge ClassName={'flex-row bg-c_green_bg space-x-1'}>
            <AgentSvg />

            <Text className={'font-inter text-2xs text-c_green'}>
              {props.userType}
            </Text>
          </Badge>
        </View>

        {/*  address  */}
        <View className={'flex-row mb-2'}>
          <IconLabel icon={<MapPinSvg />} text={props.location} />
        </View>

        {/*  bedrooms, bathrooms, balconies*/}
        <View className={'flex-row '}>
          {props.bedrooms > 0 && (
            <IconLabel
              icon={<BedSvg size={17} />}
              text={
                props.bedrooms +
                ` Bedroom${Helper.renderSingularPlural(props.bedrooms, 's')}`
              }
            />
          )}
          {props.bathrooms > 0 && (
            <IconLabel
              icon={<BathroomSvg />}
              text={
                props.bathrooms +
                ` Bathroom${Helper.renderSingularPlural(props.bathrooms, 's')}`
              }
            />
          )}
          {props.balconies > 0 && (
            <IconLabel
              icon={<BalconySvg />}
              text={
                props.balconies +
                ` Balcon${Helper.renderSingularPlural(
                  props.bathrooms,
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
            className={'font-inter-semibold text-xs'}>
            KES. {props.price} /
            <Text className={'text-11 text-grey_1 font-inter'}> Month</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default ListingItem;

export const IconLabel = ({icon, text}) => (
  <View className={'flex-row space-x-2 mr-3'}>
    {icon}

    <Text className={'font-inter text-grey_1 text-xs'}>{text}</Text>
  </View>
);

/**
 * @typedef {{
 *   image:string,
 *   title:string,
 *   userType:string,
 *   category:string,
 *   location:string,
 *   price:string,
 *   balconies:number,
 *   bedrooms:number,
 *   bathrooms:number,
 *   id:number
 *   handlePress:Function
 * }} ListingProperty
 */
