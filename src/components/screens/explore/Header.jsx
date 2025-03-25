import React from 'react';
import {TouchableOpacity, View} from 'react-native';

import {FilterSvg, SearchSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {CInput} from '@/components';

/**
 *
 * @param {{handleFilter:Function,handleSearchFocus:Function}} props
 * @returns
 */
const Header = props => {
  return (
    <View className={'flex flex-row w-full space-x-2 px-4 pt-5'}>
      {/*  search input*/}
      <CInput
        ClassName={'rounded-full flex-1 overflow-hidden border-border_grey'}
        icon={
          <View
            className={'px-3 black my-auto flex items-center justify-center'}>
            <SearchSvg size={'20'} />
          </View>
        }
        InputClassName={
          'placeholder-grey_1 flex-1 p-1.5 px-0 font-open-sauce-sans text-13'
        }
        placeHolder={'what are you looking for?'}
        placeholderTextColor={COLORS.inactive_text}
        showSoftInputOnFocus={false}
        onFocus={props.handleSearchFocus}
      />

      {/*  filter Button */}
      <TouchableOpacity
        className={
          'flex border border-border_grey justify-center items-center rounded-full m-auto h-11 w-11'
        }
        onPress={props.handleFilter}>
        <FilterSvg />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
