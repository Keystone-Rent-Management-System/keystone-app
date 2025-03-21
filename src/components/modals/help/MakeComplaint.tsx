import React, {forwardRef} from 'react';

import {ScrollView, Text, TextInput, ToastAndroid, View} from 'react-native';
import {CustomBottomSheet} from '../index';
import {CloseSvg} from '../../../assets/icons';
import {CButton} from '../../general';
import COLORS from '../../../constants/Theme';
import {z, ZodType} from 'zod';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation} from '@tanstack/react-query';
import HelpServices from '../../../services/help.ts';
import {useActiveAgrement} from '../../../hooks';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

export interface RequestHelpFormData {
  message: string;
}

export const RequestHelpFormSchema: ZodType<RequestHelpFormData> = z.object({
  message: z.string().min(3),
});

export interface IMakeComplainProps {
  handleCloseModal: () => {};
  handleSheetChanges: () => {};
}

const MakeComplaint = forwardRef<BottomSheetModal, IMakeComplainProps>(
  (props: IMakeComplainProps, ref) => {
    const {agreement} = useActiveAgrement();

    const {control, handleSubmit, reset} = useForm<RequestHelpFormData>({
      resolver: zodResolver(RequestHelpFormSchema),
      defaultValues: {
        message: '',
      },
    });

    const makeComplainMutation = useMutation({
      mutationKey: ['makeComplain'],
      mutationFn: (data: {agreementId: string; message: string}) =>
        HelpServices.makeComplain(data.message),
      onSuccess: () => {
        ToastAndroid.show(
          'Complain submitted successfully',
          ToastAndroid.SHORT,
        );
        reset();
        props.handleCloseModal();
      },
      onError: error => {
        ToastAndroid.show(
          'An error occurred while submitting your complain ' + error?.message,
          ToastAndroid.LONG,
        );
      },
    });

    const handleMakeComplain = (data: RequestHelpFormData) => {
      if (!agreement) {
        return ToastAndroid.show(
          'Error: No active agreement found',
          ToastAndroid.SHORT,
        );
      }

      makeComplainMutation.mutate({
        agreementId: agreement.id,
        message: data.message,
      });
    };

    return (
      // @ts-ignore
      <CustomBottomSheet
        snapPoints={['75%', '80%']}
        ref={ref}
        handleComponent={() => renderSheetHeader(props.handleCloseModal)}
        onChange={props.handleSheetChanges}>
        <ScrollView className={'px-4 min-h-[180px]'}>
          <Text className={'text-xs font-open-sauce-sans text-grey_1 mb-2'}>
            Share your complaint with the management to ensure you have a smooth
            experience.
          </Text>

          <View className={'flex-col items-start w-full py-3'}>
            <Text className={'text-black my-1.5 font-open-sauce-sans text-xs'}>
              What would you like to complain about?
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
                      'text-black font-open-sauce-sans border border-border_grey w-full rounded-xl  text-xs px-3'
                    }
                    numberOfLines={9}
                    placeholder={'Briefly explain your complains'}
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
        </ScrollView>

        <CButton
          disabled={makeComplainMutation.isPending}
          ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
          onPress={handleSubmit(handleMakeComplain)}>
          <Text className={'text-white font-open-sauce-sans text-13 '}>
            {makeComplainMutation?.isPending
              ? 'Saving...'
              : 'Submit Complain(s)'}
          </Text>
        </CButton>
      </CustomBottomSheet>
    );
  },
);

const renderSheetHeader = (handleClose: () => {}) => (
  <View
    className={
      ' top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-open-sauce-sans-semibold text-lg text-black'}>
      Make Complaint
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);

export default MakeComplaint;
