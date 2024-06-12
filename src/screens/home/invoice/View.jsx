import React, {useCallback, useMemo, useRef} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import {
  InvoiceBillItem,
  InvoiceFooter,
  InvoiceHeader,
  Layout,
} from '@/components';
// import {useNavigation} from '@react-navigation/native';
import {
  InvoiceConcernModal,
  InvoicePartialPaymentModal,
  InvoicePaymentMethodModal,
  InvoiceReceiptModal,
} from '@/components/modals';
import moment from 'moment';
import {
  useGetConcerns,
  useRaiseConcern,
  useSpecificInvoice,
} from '../../../hooks';
import numberWithCommas from '../../../utils/numberWithCommas';

const InvoiceView = ({route: {params}}) => {
  // const navigation = useNavigation();
  const concernModalRef = useRef();
  const receiptModalRef = useRef();
  const paymentMethodRef = useRef();
  const partialPaymentRef = useRef();

  const handleOpenConcernModal = useCallback(() => {
    concernModalRef.current?.expand();
  }, []);

  const handleCloseConcernModal = useCallback(() => {
    concernModalRef.current?.close();
  }, []);

  const handleOpenReceiptModal = useCallback(() => {
    receiptModalRef.current?.expand();
  }, []);

  const handleCloseReceiptModal = useCallback(() => {
    receiptModalRef.current?.close();
  }, []);

  const handleOpenPaymentModal = useCallback(() => {
    paymentMethodRef.current?.expand();
  }, []);

  const handleClosePaymentModal = useCallback(() => {
    paymentMethodRef.current?.close();
  }, []);

  const handleOpenPartialPaymentModal = useCallback(() => {
    partialPaymentRef.current?.expand();
  }, []);

  const handleClosePartialPaymentModal = useCallback(() => {
    partialPaymentRef.current?.close();
  }, []);

  const {invoiceIsPending, invoice} = useSpecificInvoice(params?.id);

  const {concernsIsPending, concerns, refetch} = useGetConcerns(params?.id);

  const {onSubmit} = useRaiseConcern(
    params?.id,
    handleCloseConcernModal,
    refetch,
  );

  // const handleNavigate = (screen, options) => {
  //   navigation.navigate(screen, options);
  // };

  const handleRaiseConcern = text => {
    onSubmit(text);
  };

  const hasConcern = useMemo(
    () => !concernsIsPending && concerns?.length > 0,
    [concerns, concernsIsPending],
  );
  const isUnpaid = useMemo(
    () => invoice?.totalAmount === invoice?.dueAmount,
    [invoice?.dueAmount, invoice?.totalAmount],
  );
  const isPartiallyPaid = useMemo(
    () => invoice?.paidAmount && invoice?.paidAmount < invoice?.totalAmount,
    [invoice?.paidAmount, invoice?.totalAmount],
  );
  return (
    <>
      {!invoiceIsPending && (
        <Layout ClassName={'relative'}>
          <InvoiceHeader
            invoiceAmount={invoice?.dueAmount}
            invoiceTitle={invoice?.propertyName?.split('-')[0]}
            invoiceUnit={invoice?.propertyName?.split('-')[1]}
            hasConcern={hasConcern}
            isPartial={isPartiallyPaid}
            invoiceNo={invoice?.invoiceNumber}
            userInvoiced={invoice?.billedTo}
            invoiceDate={moment(invoice?.createdAt).format('Do MMM, YYYY')}
          />

          {/*  Scroll section*/}
          <ScrollView className={'pt-20 px-4 z-0'} style={{elevation: 0}}>
            <InvoiceBillItem
              txtClassName={'font-inter text-inactive_text'}
              title={'Bill'}
              amt={'Total'}
            />
            <InvoiceBillItem
              title={'Rent'}
              amt={numberWithCommas(Number(invoice?.rentAmount)) ?? 0}
            />
            <InvoiceBillItem
              title={'Water'}
              amt={numberWithCommas(Number(invoice?.waterFeeAmount)) ?? 0}
            />
            <InvoiceBillItem
              title={'Trash/garbage'}
              amt={numberWithCommas(Number(invoice?.garbageFeeAmount)) ?? 0}
            />
            <InvoiceBillItem
              title={'Security'}
              amt={numberWithCommas(Number(invoice?.securityFeeAmount)) ?? 0}
            />
            <InvoiceBillItem
              containerClassName={'mt-3 border-t border-gray-200 py-5'}
              txtClassName={'font-inter-semibold text-black text-13'}
              title={'Total'}
              amt={invoice?.totalAmount}
            />

            {isPartiallyPaid && (
              <InvoiceBillItem
                containerClassName={'py-3 border-y border-border_grey'}
                txtClassName={'font-inter'}
                title={'Partially Paid'}
                customAmt={
                  <View className={'items-center'}>
                    <Text className={'text-11 font-inter text-inactive_text '}>
                      {moment(invoice?.updatedAt).format('HH:MMA, MMM YYYY')}
                    </Text>
                    <Text
                      className={'text-13 font-inter-semibold text-black mt-2'}>
                      KES. {numberWithCommas(Number(invoice?.paidAmount))}
                    </Text>
                  </View>
                }
              />
            )}

            {!hasConcern && (isUnpaid || isPartiallyPaid) && (
              <View>
                <Text className={'text-sm font-inter-semibold text-black mt-4'}>
                  Does this invoice have an issue?
                </Text>

                <Text
                  className={'font-inter text-xs leading-5 mt-1 text-grey_1'}>
                  The invoice has a discrepancy to what you expected,{' '}
                  <TouchableOpacity onPress={handleOpenConcernModal}>
                    <Text
                      className={
                        'underline text-xs text-primary font-inter-semibold'
                      }>
                      Raise Concern
                    </Text>
                  </TouchableOpacity>
                </Text>
              </View>
            )}
            <View className={'h-20 w-full'} />
          </ScrollView>

          <InvoiceFooter
            // handleManual={() =>
            //   handleNavigate('home_stack', {
            //     screen: 'invoice_receipt',
            //   })
            // }
            handlePartial={handleOpenPartialPaymentModal}
            // handlePrompt={() => handleNavigate('invoice_make_payment')}
            handlePrompt={handleOpenPaymentModal}
            hasConcern={hasConcern}
            handleResolve={() => {}}
            status={params?.type}
            handleViewReceipt={handleOpenReceiptModal}
          />
        </Layout>
      )}

      <InvoiceConcernModal
        ref={concernModalRef}
        handleCloseModal={handleCloseConcernModal}
        handleRaiseConcern={handleRaiseConcern}
      />

      <InvoiceReceiptModal
        statement={null}
        ref={receiptModalRef}
        handleCloseModal={handleCloseReceiptModal}
      />

      <InvoicePaymentMethodModal
        ref={paymentMethodRef}
        handleCloseModal={handleClosePaymentModal}
      />

      <InvoicePartialPaymentModal
        ref={partialPaymentRef}
        handleCloseModal={handleClosePartialPaymentModal}
        handleProceed={() => {
          handleClosePartialPaymentModal();
          handleOpenPaymentModal();
        }}
      />
    </>
  );
};

export default InvoiceView;
