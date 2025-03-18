import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import React, {forwardRef, useCallback} from 'react';

import {useAgrement} from '../../hooks';
import {useActiveAgreement} from '../../provider/store';
import {renderUnitListItem} from '../../screens/more/my_units/Current';
import {invoiceStyles} from '../../screens/tenant_home/invoice/Unpaid';
import CustomBottomSheet from './CustomBottomSheet';
import {renderSheetHeader} from './consolidated-invoices';

interface IUnitSelection {
  handleCloseFilter: () => void;
  handleOpenFilter: () => void;
}

const UnitSelection = forwardRef<BottomSheet, IUnitSelection>(
  ({handleCloseFilter}, ref) => {
    const {isPending, agreements, refetch} = useAgrement();
    const {saveAgreement} = useActiveAgreement();

    const currentUnits = !isPending
      ? agreements?.filter(
          currentAgreement =>
            currentAgreement?.status?.toLowerCase() === 'agreed' ||
            currentAgreement?.status?.toLowerCase() === 'accepted',
        )
      : [];
    const handleSelectUnit = useCallback(
      (agreement: any) => {
        saveAgreement(agreement);
        handleCloseFilter();
      },
      [handleCloseFilter, saveAgreement],
    );

    return (
      <CustomBottomSheet
        ref={ref}
        snapPoints={['81%', '81%']}
        handleComponent={() =>
          renderSheetHeader('Select Unit', handleCloseFilter)
        }>
        <BottomSheetFlatList
          contentContainerStyle={invoiceStyles.list}
          data={currentUnits}
          renderItem={({item}) =>
            renderUnitListItem(item, () => {
              handleSelectUnit(item);
            })
          }
          keyExtractor={item => item?.id}
          refreshing={isPending}
          onRefresh={refetch}
        />
      </CustomBottomSheet>
    );
  },
);

export default UnitSelection;
