import React, {forwardRef, useMemo} from 'react';
import {ScrollView, Text, TextInput, ToastAndroid, View} from 'react-native';

import {CustomBottomSheet} from './index';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';
import {useActiveAgrement} from '../../hooks';
import Helper from '../../utils/Helper';
import {useMutation} from '@tanstack/react-query';
import ExtensionRequestServices from '../../services/extension-request-services.ts';

interface IRequestExtension {
  handleCloseModal: () => void;
  handleSheetChanges: (index: number) => void;
}

const RequestExtension = forwardRef((props: IRequestExtension, ref) => {
  const {isPending, agreement} = useActiveAgrement();
  const [selectedDays, setSelectedDays] = React.useState(0);

  const rentDaysRemaining: string = useMemo(() => {
    if (isPending) {
      return 'N/A';
    }
    const rentDueDate = new Date(
      Helper.getCurrentYear(),
      Helper.getCurrentMonthInNumberForm(),
      agreement?.rentDueDate + 1,
    );

    return Helper.calculateDaysRemaining(rentDueDate);
  }, [agreement?.rentDueDate, isPending]);

  const handleDaysChange = (days: {label: string; value: number}) => {
    setSelectedDays(days.value);
  };

  const requestExtensionMutation = useMutation({
    mutationKey: ['request-extension'],
    mutationFn: () => ExtensionRequestServices.requestExtension(selectedDays),
    onSuccess: () => {
      ToastAndroid.show('Extension request sent', ToastAndroid.SHORT);
      props.handleCloseModal();
    },
    onError: () => {
      ToastAndroid.show('Error sending extension request', ToastAndroid.SHORT);
    },
  });

  return (
    // @ts-ignore
    <CustomBottomSheet
      snapPoints={['20%', '60%']}
      ref={ref}
      handleComponent={() =>
        renderSheetHeader(props.handleCloseModal, rentDaysRemaining)
      }
      onChange={props.handleSheetChanges}>
      <ScrollView className={'px-4 min-h-[180px]'}>
        <View className={'flex-col items-start w-full py-3'}>
          <Text className={'text-black my-1.5 font-inter text-xs'}>
            I would like to request an extension of;
          </Text>
        </View>
        <TextInput
          className={
            'border border-gray-200 h-11 rounded-lg text-black font-inter text-xs px-2'
          }
          placeholder={'Enter number of days'}
          placeholderTextColor={'#000000A0'}
          keyboardType={'numeric'}
          onChangeText={text => setSelectedDays(Number(text))}
        />
      </ScrollView>

      <CButton
        disabled={selectedDays === 0 || requestExtensionMutation.isPending}
        ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
        onPress={requestExtensionMutation.mutate}>
        <Text className={'text-white font-inter text-13 '}>Send Request</Text>
      </CButton>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = (handleClose: () => void, daysRemaining: string) => (
  <View className={'border-b border-border_grey mx-5'}>
    <View
      className={
        ' top-0 bg-none  py-3 z-50  flex-row justify-between items-end'
      }>
      <Text className={'font-inter-semibold text-lg text-black'}>
        Request extension
      </Text>

      <CButton
        ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
        onPress={handleClose}>
        <CloseSvg />
      </CButton>
    </View>

    <Text className={'text-xs font-inter text-grey_1 mb-2'}>
      Your rent is due in{' '}
      <Text className={'text-xs font-inter-semibold'}>
        {daysRemaining} days
      </Text>
    </Text>
  </View>
);

export default RequestExtension;
