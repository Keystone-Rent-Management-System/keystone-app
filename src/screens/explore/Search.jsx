import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback} from 'react';

import COLORS from '@/constants/Theme';

import {CInput, Layout} from '@/components';
import {RightArrowSvg} from '@/assets/icons';
import {HistorySvg} from '../../assets/icons';
import {usePropertyListing} from '../../hooks';
import {useNavigation} from '@react-navigation/native';

const Search = props => {
  const navigation = useNavigation();
  const {handleSearchChange, listings} = usePropertyListing();

  const handleViewApartment = useCallback(
    id => {
      return navigation.navigate('apartment_view', {apartment: id});
    },
    [navigation],
  );

  return (
    <Layout>
      <View
        style={styles.header}
        className={'flex flex-row w-full space-x-2 px-4 pt-5'}>
        {/*  filter Button */}
        <TouchableOpacity
          className={
            'flex border border-border_grey justify-center items-center rounded-full m-auto h-11 w-11 rotate-180'
          }
          onPress={props.handleFilter}>
          <RightArrowSvg />
        </TouchableOpacity>

        {/*  search input*/}
        <CInput
          ClassName={'rounded-full flex-1 overflow-hidden border-border_grey'}
          InputClassName={
            'placeholder-grey_1 flex-1 p-1.5 px-3 font-inter text-13'
          }
          placeHolder={'what are you looking for?'}
          placeholderTextColor={COLORS.inactive_text}
          onChangeText={handleSearchChange}
        />
      </View>

      {/* Suggestion list */}
      <FlatList
        className={'mt-3'}
        data={listings}
        renderItem={({item}) => renderSuggestionItem(item, handleViewApartment)}
        keyExtractor={(_, ind) => ind?.toString()}
      />
    </Layout>
  );
};

const renderSuggestionItem = (item, handleApartmentView) => (
  <TouchableOpacity onPress={() => handleApartmentView(item?.listingId)}>
    <View
      style={styles.suggestionItem}
      className={'mx-4 py-4 flex-row items-center border-b border-border_grey'}>
      {/* icon */}
      <HistorySvg />

      <Text
        className={
          'text-black font-inter text-xs w-11/12'
        }>{`${item?.property?.name}, ${item?.property?.address?.line}`}</Text>
    </View>
  </TouchableOpacity>
);

export default Search;

const styles = StyleSheet.create({
  header: {
    gap: 15,
  },
  suggestionItem: {
    gap: 20,
  },
});
