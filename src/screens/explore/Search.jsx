import {View, TouchableOpacity, StyleSheet, FlatList, Text} from 'react-native';
import React from 'react';

import COLORS from '@/constants/Theme';

import {CInput, Layout} from '@/components';
import {RightArrowSvg} from '@/assets/icons';
import {HistorySvg} from '../../assets/icons';

const Search = props => {
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
        />
      </View>

      {/* Suggestion list */}
      <FlatList
        className={'mt-3'}
        data={suggestions}
        renderItem={renderSuggestionItem}
        keyExtractor={(_, ind) => ind}
      />
    </Layout>
  );
};

const renderSuggestionItem = ({item}) => (
  <View
    style={styles.suggestionItem}
    className={'mx-4 py-4 flex-row items-center border-b border-border_grey'}>
    {/* icon */}
    <HistorySvg />

    <Text className={'text-black font-inter text-xs'}>{item}</Text>
  </View>
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

const suggestions = ['2 bedroom Kilimani', 'Apartment 360 Runda', '1 Bedroom'];
