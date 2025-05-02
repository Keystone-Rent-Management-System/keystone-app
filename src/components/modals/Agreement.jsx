import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import CheckBox from '@react-native-community/checkbox';
import {useBottomSheetModal} from '@gorhom/bottom-sheet';

import CustomBottomSheetModal from './CustomBottomSheetModal';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';
import PdfPreview from '../screens/agreement/pdf-preview';
import COLORS from '../../constants/Theme';
import {useAcceptAgrement} from '../../hooks';
import {agreementsKey} from '../../hooks/useAgrement';

const AgreementModalSheet = forwardRef((props, ref) => {
  const agreementModalRef = useRef();
  const [isSelected, setSelection] = useState(false);
  const queryClient = useQueryClient();

  const handleOpenAgreement = data => {
    agreementModalRef?.current?.present();
  };

  const {dismiss} = useBottomSheetModal();
  const refetch = () => queryClient.invalidateQueries(agreementsKey);

  const {acceptAgrementMutation, handleAcceptAgreement} = useAcceptAgrement(
    dismiss,
    refetch,
  );

  useImperativeHandle(ref, () => ({
    present: () => agreementModalRef.current.present(),
    dismiss: () => dismiss(),
  }));

  return (
    <>
      {/*   modal trigger   */}
      <TouchableOpacity onPress={handleOpenAgreement}>
        {props?.children}
      </TouchableOpacity>

      <CustomBottomSheetModal
        ref={agreementModalRef}
        snapPoints={['98%', '98%']}
        enableDynamicSizing={false}
        handleComponent={() => renderSheetHeader(props?.type)}>
        <View
          className={`overflow-hidden ${
            props.type === 'agreed' ? 'h-auto' : 'h-5/6'
          }`}>
          <PdfPreview agreementId={props.agreement?.id} />
        </View>

        <View className="">
          {props?.agreement?.status?.toLocaleLowerCase() ===
          'terminated' ? null : props.type === 'agreed' ? (
            <View
              className={
                'py-5 mt-0 w-full flex-row justify-center border-t border-gray-200'
              }>
              <TouchableOpacity onPress={props?.handleIssueTermination}>
                <Text className={'text-red-700 font-open-sauce-sans-semibold'}>
                  Issue Termination Notice
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            props?.type === 'pending' && (
              <View className={'w-full px-5'}>
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
                  <Text
                    className={'text-black mx-8 font-open-sauce-sans text-xs'}>
                    By checking here you confirm that you have read the
                    agreement.{' '}
                  </Text>
                </View>
                <CButton
                  ClassName={'bg-primary text-white'}
                  disabled={!isSelected}
                  isLoading={acceptAgrementMutation.isPending}
                  onPress={() => handleAcceptAgreement(props.agreement.id)}
                  textClassName={'text-white font'}
                  text={
                    acceptAgrementMutation.isPending
                      ? 'Accepting...'
                      : 'I agree to the terms'
                  }
                />
              </View>
            )
          )}
        </View>
      </CustomBottomSheetModal>
    </>
  );
});
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
          className={
            'font-open-sauce-sans-semibold text-lg text-black mr-2 uppercase'
          }>
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
