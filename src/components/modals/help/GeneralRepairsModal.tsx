import React, {forwardRef} from 'react';

import {ScrollView, Text, TextInput, ToastAndroid, View} from 'react-native';
import {CustomBottomSheet} from '../index';
import COLORS from '../../../constants/Theme';
import {CButton} from '../../general';
import {CloseSvg} from '../../../assets/icons';
import {useActiveAgrement} from '../../../hooks';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  IMakeComplainProps,
  RequestHelpFormData,
  RequestHelpFormSchema,
} from './MakeComplaint';
import {useMutation} from '@tanstack/react-query';
import HelpServices from '../../../services/help.ts';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

const GeneralRepairsModal = forwardRef<BottomSheetModal, IMakeComplainProps>(
  (props: IMakeComplainProps, ref) => {
    const {agreement} = useActiveAgrement();

    const {control, handleSubmit, reset} = useForm<RequestHelpFormData>({
      resolver: zodResolver(RequestHelpFormSchema),
      defaultValues: {
        message: '',
      },
    });

    const requestGeneralAssistance = useMutation({
      mutationKey: ['generalAssistance'],
      mutationFn: (data: {agreementId: string; message: string}) =>
        HelpServices.generalAssistance(data.message),
      onSuccess: () => {
        ToastAndroid.show(
          'Assistance requested successfully',
          ToastAndroid.SHORT,
        );
        reset();
        props.handleCloseModal();
      },
      onError: error => {
        ToastAndroid.show(
          'An error occurred requesting assistance ' + error?.message,
          ToastAndroid.LONG,
        );
      },
    });

    const handleRequestAssistance = (data: RequestHelpFormData) => {
      if (!agreement) {
        return ToastAndroid.show(
          'Error: No active agreement found',
          ToastAndroid.SHORT,
        );
      }

      requestGeneralAssistance.mutate({
        agreementId: agreement.id,
        message: data.message,
      });
    };

    return (
      // @ts-ignore
      <CustomBottomSheet
        snapPoints={['20%', '60%']}
        ref={ref}
        handleComponent={() => renderSheetHeader(props.handleCloseModal)}
        onChange={props.handleSheetChanges}>
        <ScrollView className={'px-4 min-h-[180px]'}>
          <Text className={'text-xs font-open-sauce-sans text-grey_1 mb-2'}>
            Get help on any other issue not indicated.
          </Text>

          <View className={'flex-col items-start w-full py-3'}>
            <Text className={'text-black my-1.5 font-open-sauce-sans text-xs'}>
              What would you like help with ?
            </Text>

            <Controller
              control={control}
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => (
                <>
                  <TextInput
                    className={
                      'text-black font-open-sauce-sans border border-border_grey w-full rounded-xl text-xs px-3'
                    }
                    numberOfLines={5}
                    placeholder={'Enter Details'}
                    placeholderTextColor={COLORS.border_grey}
                    style={{
                      textAlignVertical: 'top',
                    }}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                  {error && (
                    <Text
                      className={
                        'text-xs font-open-sauce-sans-medium leading-5 text-red-600'
                      }>
                      {error?.message}
                    </Text>
                  )}
                </>
              )}
              name={'message'}
            />
          </View>

          <View className={'flex-row flex-wrap mt-3 justify-center'}>
            {helpTypes?.map(type => (
              <CButton
                key={type}
                ClassName={
                  ' bg-white py-0 rounded-xl border border-primary h-9 m-1.5'
                }
                // onPress={handleClose}
              >
                <Text className={'text-primary font-open-sauce-sans text-xs'}>
                  {type}
                </Text>
              </CButton>
            ))}
          </View>
        </ScrollView>

        <CButton
          disabled={requestGeneralAssistance.isPending}
          ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
          onPress={handleSubmit(handleRequestAssistance)}>
          <Text className={'text-white font-open-sauce-sans text-13 '}>
            {requestGeneralAssistance?.isPending
              ? 'Sending request...'
              : 'Submit'}
          </Text>
        </CButton>
      </CustomBottomSheet>
    );
  },
);

const renderSheetHeader = (handleClose: any) => (
  <View
    className={
      ' top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-open-sauce-sans-semibold text-lg text-black'}>
      General Assistance
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);
export default GeneralRepairsModal;

const helpTypes = ['Repairs', 'Notice', 'Complains', 'Call', 'Contact'];
