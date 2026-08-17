import React, {forwardRef, useState} from 'react';

import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useMutation} from '@tanstack/react-query';
import {Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {CameraSvg, CloseSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import HelpServices from '../../../services/help';
import {getError} from '../../../utils/getError';
import {compressImage} from '../../../utils/payment';
import {CButton} from '../../general';
import {CustomBottomSheet} from '../index';
import {toast} from '../../../utils/toast';

const PaymentAllocation = forwardRef((props, ref) => {
  const [image, setImage] = useState(null);
  const [code, setCode] = useState('');

  const handleCamera = async () => {
    const img = await launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          return;
        }
        setImage(response?.uri);
      },
    );

    compressImage(img.assets?.at(0), setImage);
  };

  const renderImage = () => {
    if (image?.uri) {
      return (
        <Image
          source={{uri: image?.uri}}
          alt="img"
          className={'w-full h-full rounded-xl'}
          resizeMode="contain"
          height={100}
          width={100}
        />
      );
    }
    return (
      <>
        <View>
          <CameraSvg h={36} />
        </View>
        <Text className={'text-gray-600 text-xs'}>
          Click here to take a photo of the payment made
        </Text>
      </>
    );
  };

  const submitPayment = useMutation({
    mutationKey: ['allocate-payment'],
    mutationFn: async () => {
      const formData = new FormData();

      // Append fields to the FormData objec
      formData.append('attachmentFile', {
        uri: image?.uri,
        type: 'image/jpeg',
        name: image?.fileName,
      });

      return await HelpServices.allocatePayments(
        {
          transactionCode: code,
        },
        formData,
      );
    },
    onSuccess: () => {
      toast.show(
        'Payment allocation request sent successfully',
        toast.LONG,
      );
      props?.handleCloseModal();
    },
    onError: _err => {
      toast.show(
        'Error: Failed to verify payment ' + getError(_err),
        toast.LONG,
      );
    },
  });

  const handleSubmit = () => {
    //     validate
    if (!code) {
      return toast.show(
        'Please enter a transaction code',
        toast.LONG,
      );
    }
    if (!image) {
      return toast.show(
        'Please upload a proof of payment',
        toast.LONG,
      );
    }

    submitPayment.mutate();
  };

  return (
    <CustomBottomSheet
      snapPoints={['20%', '75%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props?.handleSheetChanges}>
      <BottomSheetScrollView className={'flex-1'}>
        <View className="px-4 min-h-[180px]">
          <Text className={'text-xs font-open-sauce-sans text-grey_1 mb-2'}>
            Input a transaction code that will be used to full fill the payment
            of your invoice.
          </Text>

          <View className={'flex-col items-start w-full py-3'}>
            <Text className={'text-black my-1.5 font-open-sauce-sans text-xs'}>
              Enter a transaction code
            </Text>

            <TextInput
              className={
                'text-black font-open-sauce-sans border border-border_grey w-full rounded-xl text-xs px-3'
              }
              placeholder={'(e.g.TCB488B...)'}
              placeholderTextColor={COLORS.grey_1}
              onChangeText={setCode}
              value={code}
            />
          </View>

          <View className={'flex-col items-start w-full py-3'}>
            <TouchableOpacity
              className={
                'flex flex-col justify-center items-center h-40 bg-border_grey w-full rounded-xl my-3'
              }
              onPress={handleCamera}>
              {renderImage()}
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetScrollView>

      <CButton
        disabled={submitPayment.isPending}
        ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
        onPress={handleSubmit}>
        <Text className={'text-white font-open-sauce-sans text-13 '}>
          {submitPayment?.isPending ? 'saving...' : 'Submit'}
        </Text>
      </CButton>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View
    className={
      ' top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-open-sauce-sans-semibold text-lg text-black'}>
      Allocate payment
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);

export default PaymentAllocation;
