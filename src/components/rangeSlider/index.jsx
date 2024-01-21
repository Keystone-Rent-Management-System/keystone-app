import {View, StyleSheet} from 'react-native';
import React, {useCallback} from 'react';
import RnRangeSlider from 'rn-range-slider';
import COLORS from '../../constants/Theme';

const THUMB_RADIUS_LOW = 12;

const CRangeSlider = () => {
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);

  return (
    <View className={'my-7 px-1'}>
      <RnRangeSlider
        // values={values}
        // onValuesChange={handleValuesChange}
        min={0}
        max={1000}
        step={1}
        allowOverlap={false} // Prevent thumbs from overlapping
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        renderThumb={renderThumb}
      />
    </View>
  );
};

const Thumb = ({name}) => {
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
