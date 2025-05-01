import React, {forwardRef, useCallback, useMemo} from 'react';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';

import COLORS from '../../constants/Theme';
import {BottomSheetMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import type {BottomSheetProps} from '@gorhom/bottom-sheet/src/components/bottomSheet/types';

interface ICustomBottomSheetProps extends BottomSheetProps {
  snapPoints?: (string | number)[];
  backdropOpacity?: number;
  children: React.ReactNode;
}

const CustomBottomSheet = forwardRef<
  BottomSheetMethods,
  ICustomBottomSheetProps
>((props, ref) => {
  const snapPoints = useMemo(
    () => (props?.snapPoints ? props.snapPoints : ['50%']),
    [props.snapPoints],
  );

  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        opacity={props?.backdropOpacity ? props?.backdropOpacity : 0.5}
        {...backdropProps}
      />
    ),
    [props?.backdropOpacity],
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

export const renderBackdrop = (backdropProps: any) => (
  <BottomSheetBackdrop opacity={0.5} {...backdropProps} />
);

export const CommonBottomSheetProps: Partial<BottomSheetProps> = {
  index: -1,
  snapPoints: ['50%'],
  backdropComponent: renderBackdrop,
  enableDynamicSizing: false,
  enablePanDownToClose: true,
  enableContentPanningGesture: false,
  handleIndicatorStyle: {backgroundColor: COLORS.white},
  containerStyle: {
    zIndex: 100,
    elevation: 10,
  },
};

export default CustomBottomSheet;
