import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import COLORS from '../../../constants/Theme';

const FilterBtn = () => {
  const [currentFilter, setFilter] = useState('all');

  const handleFilterChange = useCallback(item => {
    setFilter(item);
  }, []);

  return (
    <Dropdown
      style={styles.dropdown}
      containerStyle={styles.containerStyle}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      itemContainerStyle={styles.itemContainerStyle}
      itemTextStyle={styles.itemTextStyle}
      iconStyle={styles.iconStyle}
      data={filters}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder="Select item"
      value={currentFilter}
      renderItem={renderItem}
      onChange={handleFilterChange}
    />
  );
};

const renderItem = item => {
  console.log('ITEM ISS', item);
  return (
    <View className={'py-2'}>
      <Text style={styles.itemTextStyle}>{item?.label}</Text>
    </View>
  );
};
export default FilterBtn;

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    borderColor: COLORS.border_grey,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 50,
    minWidth: 100,
    width: 'auto',
    elevation: 0,
  },
  containerStyle: {
    borderRadius: 10,
    borderColor: COLORS.border_grey,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 12,
  },
  selectedTextStyle: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  itemContainerStyle: {
    minWidth: 100,
  },
  itemTextStyle: {
    fontSize: 12,
    color: COLORS.grey_1,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginVertical: 0,
  },
});

const filters = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'January',
    value: 'january',
  },
  {
    label: 'February',
    value: 'february',
  },
  {
    label: 'March',
    value: 'march',
  },
  {
    label: 'April',
    value: 'april',
  },
  {
    label: 'May',
    value: 'may',
  },
];
