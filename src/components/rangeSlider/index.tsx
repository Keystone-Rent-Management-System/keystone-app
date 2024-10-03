import {StyleSheet, View} from 'react-native';
import React, {useCallback} from 'react';
import RnRangeSlider from 'rn-range-slider';
import COLORS from '../../constants/Theme';

const THUMB_RADIUS_LOW = 12;

interface ICRangeSlider {
  minVal: number;
  maxVal: number;
  step?: number;
  onValuesChange?: (low: number, high: number) => void;
}

const CRangeSlider = ({
  minVal = 1,
  maxVal = 10000000,
  step = 1,
  onValuesChange,
}: ICRangeSlider) => {
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);

  return (
    <View className={'my-7 px-1'}>
      <RnRangeSlider
        onValueChanged={onValuesChange}
        min={minVal}
        max={maxVal}
        step={step}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        renderThumb={renderThumb}
      />
    </View>
  );
};

const Thumb = () => {
  return <View style={styles.thumb} />;
};

const Rail = () => {
  return <View style={styles.rail} />;
};

const RailSelected = () => {
  return <View style={styles.selectedRail} />;
};

const styles = StyleSheet.create({
  thumb: {
    width: THUMB_RADIUS_LOW * 2,
    height: THUMB_RADIUS_LOW * 2,
    borderRadius: THUMB_RADIUS_LOW,
    borderWidth: 1,
    borderColor: COLORS.border_grey,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  rail: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.border_grey,
  },
  selectedRail: {
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});

export default CRangeSlider;
