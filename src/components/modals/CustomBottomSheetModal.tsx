import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import React, {forwardRef, useCallback} from 'react';
import COLORS from '../../constants/Theme';

const CustomBottomSheet = forwardRef<BottomSheetModal, BottomSheetModalProps>(
  (props, ref) => {
    const renderBackdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop opacity={0.5} {...backdropProps} />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        enableContentPanningGesture={false}
        handleIndicatorStyle={{backgroundColor: COLORS.white}}
        {...props}>
        {props?.children}
      </BottomSheetModal>
    );
  },
);

export default CustomBottomSheet;
