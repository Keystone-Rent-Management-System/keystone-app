import BottomSheet from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import React, {forwardRef, useCallback, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import {CloseSvg} from '../../assets/icons';
import {
  Duration,
  getFromAndEndDateFromDuration,
  IFromEndDate,
} from '../../utils/statement';
import {CButton} from '../general';
import {StatementDatePicker} from '../screens';
import CustomBottomSheet from './CustomBottomSheet';

interface IStatementFilterProps {
  handleCloseFilter: () => void;
}

const StatementFilter = forwardRef<BottomSheet, IStatementFilterProps>(
  ({handleCloseFilter}, ref) => {
    const navigation = useNavigation<any>();
    const [selectedDuration, setSelectedDuration] = useState<Duration | null>(
      null,
    );
    const [fromEndDate, setFromEndDate] = useState<IFromEndDate | null>(null);

    const chosenDateRange: IFromEndDate | null = useMemo(() => {
      if (selectedDuration) {
        return getFromAndEndDateFromDuration(selectedDuration);
      } else if (fromEndDate?.from && fromEndDate?.to) {
        return fromEndDate;
      }
      return null;
    }, [selectedDuration, fromEndDate]);

    const handleDurationSelection = (duration: Duration) => {
      setSelectedDuration(duration);
      setFromEndDate(null);
    };

    const handleFromChange = useCallback((date: Date) => {
      setFromEndDate(prev => {
        return {...prev, from: date};
      });
    }, []);

    const handleToChange = useCallback((date: Date) => {
      setFromEndDate(prev => {
        return {...prev, to: date};
      });
    }, []);

    const handleResetState = useCallback(() => {
      setSelectedDuration(null);
      setFromEndDate(null);
    }, []);

    const handleGenerateStatement = useCallback(() => {
      handleCloseFilter();
      navigation.navigate('statements', {dateRange: chosenDateRange});

      // Reset the state
      handleResetState();
    }, [handleCloseFilter, navigation, chosenDateRange, handleResetState]);

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
            {monthFilters.map((filter, ind) => (
              <CButton
                textClassName={`font-open-sauce-sans text-[13px] ${
                  filter?.value === selectedDuration
                    ? 'text-white'
                    : 'text-primary'
                } `}
                ClassName={`border ${
                  filter?.value === selectedDuration
                    ? 'border-primary bg-primary'
                    : 'border-[#DEDEDE]'
                } py-2 px-3 mb-1`}
                text={filter.text}
                onPress={() =>
                  handleDurationSelection(filter.value as Duration)
                }
                key={ind}
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
                  'bg-white py-1 px-4 text-xs text-black font-open-sauce-sans-medium'
                }>
                OR
              </Text>
            </View>
          </View>

          {/* date range */}
          <View>
            <Text className={'font-open-sauce-sans-semibold text-base text-black mb-4'}>
              Pick the date range
            </Text>

            <StatementDatePicker
              label={'Start Date'}
              placeholder={'Select Date'}
              setValue={handleFromChange}
              value={fromEndDate?.from}
            />

            {/* Separator */}
            <View className={'h-3 w-full'} />

            <StatementDatePicker
              label={'End Date'}
              placeholder={'Select Date'}
              setValue={handleToChange}
              value={fromEndDate?.to}
            />
          </View>
        </ScrollView>

        {/*    generate button  */}
        <View className={'mx-5 absolute inset-x-0 bottom-3'}>
          <CButton
            ClassName={'bg-primary py-3 rounded-lg'}
            textClassName={'text-white font-open-sauce-sans-semibold text-base'}
            text={'Generate Statement'}
            onPress={handleGenerateStatement}
            disabled={!chosenDateRange}
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
      <Text className={'font-open-sauce-sans-semibold text-lg text-black'}>
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

type MonthFilter = {
  text: string;
  value: Duration;
};

const monthFilters: MonthFilter[] = [
  {text: 'This Month', value: 'this_month'},
  {text: '2 Months', value: '2_months'},
  {text: '4 Months', value: '4_months'},
  {text: '6 Months', value: '6_months'},
  {text: '1 Year', value: '1_years'},
  {text: '2 Years', value: '2_years'},
];

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 50,
  },
});
