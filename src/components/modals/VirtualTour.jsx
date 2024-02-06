import {Image, StyleSheet, View} from 'react-native';
import React, {forwardRef} from 'react';
import {CustomBottomSheet} from '.';
import {BackSvg, UploadSvg} from '@/assets/icons';
import {ExploreActionBtn} from '@/components';

const VirtualTour = forwardRef((props, ref) => {
  return (
    <CustomBottomSheet
      snapPoints={['100%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseTour)}
      onChange={props.handleSheetChanges}>
      <Image source={props.source} className={'flex-1'} alt={'virtual-tour'} />
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View className={'absolute inset-x-0 top-0 bg-none px-4 py-3 z-50  flex-row'}>
    <ExploreActionBtn
      ClassName={'bg-white h-9 w-9 items-center justify-center z-10'}
      icon={<BackSvg size="16" />}
      handlePress={handleClose}
    />

    <View
      style={styles.actionButtonWrapper}
      className={'flex-1 flex-row justify-end shadow-xl'}>
      <ExploreActionBtn ClassName={'bg-white'} icon={<UploadSvg />} />
    </View>
  </View>
);

export default VirtualTour;

const styles = StyleSheet.create({
  actionButtonWrapper: {
    gap: 15,
  },
});
