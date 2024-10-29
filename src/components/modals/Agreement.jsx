import React, {useRef, useState} from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import CustomBottomSheetModal from './CustomBottomSheetModal';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';
import {BottomSheetScrollView, useBottomSheetModal} from '@gorhom/bottom-sheet';
import PdfPreview from '../screens/agreement/pdf-preview';
import CheckBox from '@react-native-community/checkbox';
import COLORS from '../../constants/Theme';

const AgreementModalSheet = props => {
  const agreementModalRef = useRef();
  const [isSelected, setSelection] = useState(false);

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
          <PdfPreview agreementId={props.agreement.id} />
        </BottomSheetScrollView>

        {props.type === 'agreed' ? (
          <View className={'py-5 pb-10 w-full flex-row justify-center'}>
            <TouchableOpacity onPress={props?.handleIssueTermination}>
              <Text className={'text-red-700 font-inter-semibold'}>
                Issue Termination Notice
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          props?.type === 'pending' && (
            <View className={'w-full pb-5 px-5 '}>
              <View
                className={
                  'py-5 w-full flex flex-row items-start justify-center gap-1'
                }>
                <CheckBox
                  disabled={false}
                  value={isSelected}
                  onValueChange={newValue => setSelection(newValue)}
                  tintColors={{true: COLORS.primary, false: COLORS.primary}}
                  tintColor={COLORS.primary}
                  onFillColor={COLORS.primary}
                />
                <Text className={'text-black mx-8 font-inter text-xs'}>
                  By checking here you confirm that you have read the agreement.{' '}
                </Text>
              </View>
              <CButton
                ClassName={'bg-primary text-white'}
                disabled={!isSelected}
                isLoading={props?.acceptAgrementMutation.isPending}
                onPress={() => props?.handleAcceptAgreement(props.agreement.id)}
                textClassName={'text-white font'}
                text={
                  props.acceptAgrementMutation.isPending
                    ? 'Accepting...'
                    : 'I agree to the terms'
                }
              />
            </View>
          )
        )}
      </CustomBottomSheetModal>
    </>
  );
};
export default AgreementModalSheet;

const renderSheetHeader = type => <SheetHeader type={type} />;
const SheetHeader = () => {
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
