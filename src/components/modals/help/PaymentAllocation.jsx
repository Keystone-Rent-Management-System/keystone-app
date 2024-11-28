import React, {forwardRef, useState} from 'react';

import {useMutation} from '@tanstack/react-query';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {CameraSvg, CloseSvg} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import HelpServices from '../../../services/help';
import {CButton} from '../../general';
import {CustomBottomSheet} from '../index';

const PaymentAllocation = forwardRef((props, ref) => {
  const [image, setImage] = useState(null);
  const [code, setCode] = useState('');

  const handleCamera = async () => {
    const img = await launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1000,
        maxWidth: 1000,
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
    setImage(img?.assets?.at(0));
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
      ToastAndroid.show(
        'Payment allocation request sent successfully',
        ToastAndroid.LONG,
      );
      props?.handleCloseModal();
    },
    onError: err => {
      console.log('ERROR IS::', err);
      ToastAndroid.show('Error: Failed to verify payment', ToastAndroid.LONG);
    },
  });

  const handleSubmit = () => {
    //     validate
    if (!code) {
      return ToastAndroid.show(
        'Please enter a transaction code',
        ToastAndroid.LONG,
      );
    }
    if (!image) {
      return ToastAndroid.show(
        'Please upload a proof of payment',
        ToastAndroid.LONG,
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
      <ScrollView className={'px-4 min-h-[180px]'}>
        <Text className={'text-xs font-inter text-grey_1 mb-2'}>
          Input a transaction code that will be used to full fill the payment of
          your invoice.
        </Text>

        <View className={'flex-col items-start w-full py-3'}>
          <Text className={'text-black my-1.5 font-inter text-xs'}>
            Enter a transaction code
          </Text>

          <TextInput
            className={
              'text-black font-inter border border-border_grey w-full rounded-xl text-xs px-3'
            }
            placeholder={'Enter a transaction code'}
            placeholderTextColor={COLORS.border_grey}
            style={{
              textAlignVertical: 'top',
            }}
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
      </ScrollView>

      <CButton
        disabled={submitPayment.isPending}
        ClassName={'bg-primary text-white py-3.5 mx-5 mb-3'}
        onPress={handleSubmit}>
        <Text className={'text-white font-inter text-13 '}>
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
    <Text className={'font-inter-semibold text-lg text-black'}>
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
