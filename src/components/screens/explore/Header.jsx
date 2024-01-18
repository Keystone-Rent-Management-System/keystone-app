import React from 'react';

import {TouchableOpacity, View} from 'react-native';
import CInput from '../../general/CInput';
import {FilterSvg, SearchSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';

const Header = () => {
  return (
    <View className={'flex flex-row w-full space-x-2 px-4 pt-5'}>
      {/*  search input*/}
      <CInput
        ClassName={'rounded-full flex-1 overflow-hidden border-border_grey'}
        icon={
          <View
            className={'px-3 black my-auto flex items-center justify-center'}>
            <SearchSvg size={'23'} />
          </View>
        }
        InputClassName={'placeholder-grey_1 flex-1 p-2 px-0 font-inter text-13'}
        placeHolder={'what are you looking for?'}
        placeholderTextColor={COLORS.inactive_text}
      />

      {/*  filter Button */}
      <TouchableOpacity
        className={
          'flex border border-border_grey justify-center items-center rounded-full h-12 w-12'
        }>
        <FilterSvg />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
