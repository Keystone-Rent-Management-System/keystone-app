import BottomSheet from '@gorhom/bottom-sheet';
import React, {forwardRef} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {CloseSvg} from '../../assets/icons';
import {CButton} from '../general';
import CustomBottomSheet from './CustomBottomSheet';
import {StatementDatePicker} from '../screens';
import {useNavigation} from '@react-navigation/native';

interface IStatementFilterProps {
  handleCloseFilter: () => void;
}

const StatementFilter = forwardRef<BottomSheet, IStatementFilterProps>(
  ({handleCloseFilter}, ref) => {
    const navigation = useNavigation<any>();

    const handleGenerateStatement = () => {
      handleCloseFilter();
      navigation.navigate('statements');
    };

    return (
      <CustomBottomSheet
        ref={ref}
        snapPoints={['81%', '81%']}
        handleComponent={() => renderSheetHeader(handleCloseFilter)}>
        <ScrollView
          className="p-5"
          contentContainerStyle={styles.contentContainer}>
          {/* months filter */}
          <View className="flex flex-row flex-wrap gap-3">
            {monthFilters.map(filter => (
              <CButton
                textClassName="text-primary font-inter text-[13px]"
                ClassName={'border border-[#DEDEDE] py-2 px-3 mb-1'}
                text={filter.text}
              />
            ))}
          </View>

          {/* separator */}
          <View className={'relative my-10'}>
            {/* line */}
            <View
              className={'absolute top-1/2 left-0  right-0 h-px bg-border_grey'}
            />

            <View
              className={
                'absolute -top-3 right-0 left-0 flex flex-row justify-center items-center'
              }>
              <Text
                className={
                  'bg-white py-1 px-4 text-xs text-black font-inter-medium'
                }>
                OR
              </Text>
            </View>
          </View>

          {/* date range */}
          <View>
            <Text className={'font-inter-semibold text-base text-black mb-4'}>
              Pick the date range
            </Text>

            <StatementDatePicker
              label={'Start Date'}
              placeholder={'Select Date'}
            />
            <View className={'h-3 w-full'} />
            <StatementDatePicker
              label={'End Date'}
              placeholder={'Select Date'}
            />
          </View>
        </ScrollView>

        {/*    generate button  */}
        <View className={'mx-5 absolute inset-x-0 bottom-3'}>
          <CButton
            ClassName={'bg-primary py-3 rounded-lg'}
            textClassName={'text-white font-inter-semibold text-base'}
            text={'Generate Statement'}
            onPress={handleGenerateStatement}
          />
        </View>
      </CustomBottomSheet>
    );
  },
);

export default StatementFilter;

const renderSheetHeader = (handleClose: () => void) => (
  <View className={'border-b border-border_grey mx-5'}>
    <View
      className={
        'top-0 bg-none py-3 z-50 flex-row justify-between items-center'
      }>
      <Text className={'font-inter-semibold text-lg text-black'}>
        Generate Statement
      </Text>

      <CButton
        ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
        onPress={handleClose}>
        {/* @ts-ignore */}
        <CloseSvg />
      </CButton>
    </View>
  </View>
);

const monthFilters = [
  {text: 'This Month', value: 'this_month'},
  {text: '2 Months', value: '2_months'},
  {text: '4 Months', value: '4_months'},
  {text: '6 Months', value: '6_months'},
  {text: '1 Year', value: '1_year'},
  {text: '2 Years', value: '2_year'},
];

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 50,
  },
});
