import React, {forwardRef, useCallback, useMemo} from 'react';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';

import COLORS from '@/constants/Theme';

const CustomBottomSheet = forwardRef((props, ref) => {
  const snapPoints = useMemo(
    () => (props?.snapPoints ? props.snapPoints : ['50%']),
    [props.snapPoints],
  );

  const renderBackdrop = useCallback(
    backdropProps => <BottomSheetBackdrop {...backdropProps} />,
    [],
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      enableContentPanningGesture={false}
      handleIndicatorStyle={{backgroundColor: COLORS.white}}
      {...props}>
      {props?.children}
    </BottomSheet>
  );
});

export default CustomBottomSheet;
