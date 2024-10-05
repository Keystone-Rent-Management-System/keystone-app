import React, {useRef} from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import CustomBottomSheetModal from './CustomBottomSheetModal';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';
import {BottomSheetScrollView, useBottomSheetModal} from '@gorhom/bottom-sheet';
import PdfPreview from '../screens/agreement/pdf-preview';

const AgreementModalSheet = props => {
  const agreementModalRef = useRef();

  const handleOpenAgreement = data => {
    agreementModalRef?.current?.present();
  };

  return (
    <>
      {/*   modal trigger   */}
      <TouchableOpacity onPress={handleOpenAgreement}>
        {props?.children}
      </TouchableOpacity>
      <CustomBottomSheetModal
        ref={agreementModalRef}
        snapPoints={['50%', '99%']}
        handleComponent={() => renderSheetHeader(props?.type)}>
        <BottomSheetScrollView style={{flexDirection: 'row'}}>
          <PdfPreview />
        </BottomSheetScrollView>
      </CustomBottomSheetModal>
    </>
  );
};
export default AgreementModalSheet;

const renderSheetHeader = type => <SheetHeader type={type} />;
const SheetHeader = ({type}) => {
  const {dismiss} = useBottomSheetModal();

  return (
    <View
      className={
        ' top-0 bg-none py-3 pb-1 z-50 flex-row justify-between items-end mx-4 space-x-2'
      }>
      <View className={'flex-row'}>
        <Text
          className={'font-inter-semibold text-lg text-black mr-2 uppercase'}>
          Tenancy Agreement
        </Text>
      </View>

      <CButton
        ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
        onPress={() => dismiss()}>
        <CloseSvg />
      </CButton>
    </View>
  );
};
