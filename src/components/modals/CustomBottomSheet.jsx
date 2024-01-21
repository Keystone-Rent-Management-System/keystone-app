import React, {forwardRef, useCallback, useMemo} from 'react';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';

import COLORS from '@/constants/Theme';

const CustomBottomSheet = forwardRef((props, ref) => {
  const snapPoints = useMemo(
    () => (props?.snapPoints ? props.snapPoints : ['25%', '50%', '95%']),
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
      handleIndicatorStyle={{backgroundColor: COLORS.white}}
      {...props}>
      {props?.children}
    </BottomSheet>
  );
});

export default CustomBottomSheet;
