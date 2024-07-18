import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import COLORS from '../../../constants/Theme';

const ExtensionDropdown = () => {
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
      placeholder="choose number of days"
      value={currentFilter + 'day(s)'}
      renderItem={renderItem}
      onChange={handleFilterChange}
    />
  );
};

const renderItem = item => {
  return (
    <View className={'py-2'}>
      <Text style={styles.itemTextStyle}>{item?.label} days</Text>
    </View>
  );
};
export default ExtensionDropdown;

const styles = StyleSheet.create({
  dropdown: {
    height: 45,
    borderColor: COLORS.border_grey,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: 'full',
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
    color: COLORS.grey_1,
    fontFamily: 'Inter-Regular',
  },
  selectedTextStyle: {
    fontSize: 12,
    color: 'black',
    fontFamily: 'Inter-Medium',
    textAlign: 'left',
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
    paddingHorizontal: 10,
  },
  itemTextStyle: {
    fontSize: 12,
    color: COLORS.grey_1,
    fontFamily: 'Inter-Regular',
    textAlign: 'left',
    marginVertical: 0,
  },
});

const filters = [
  {
    label: '1',
    value: '1',
  },
  {
    label: '2',
    value: '2',
  },
  {
    label: '3',
    value: '3',
  },
  {
    label: '4',
    value: '4',
  },
  {
    label: '5',
    value: '5',
  },
  {
    label: '6',
    value: '6',
  },
  {
    label: '7',
    value: '7',
  },
  {
    label: '8',
    value: '8',
  },
];
