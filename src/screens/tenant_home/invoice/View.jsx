import React, {useCallback, useMemo, useRef} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import {
  InvoiceBillItem,
  InvoiceFooter,
  InvoiceHeader,
  Layout,
} from '@/components';
import {InvoiceConcernModal, InvoiceReceiptModal} from '@/components/modals';
import moment from 'moment';
import {
  useGetConcerns,
  useRaiseConcern,
  useSpecificInvoice,
} from '../../../hooks';
import numberWithCommas from '../../../utils/numberWithCommas';
import PaymentInstructions from '../../../components/modals/PaymentInstructions';
import numberConverter from '../../../utils/numberConverter';

const InvoiceView = ({route: {params}}) => {
  const concernModalRef = useRef();
  const receiptModalRef = useRef();
  const paymentInstrictionsRef = useRef();

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

  const handleOpenPaymentInstrictionsModal = useCallback(() => {
    paymentInstrictionsRef.current?.expand();
  }, []);

  const handleClosePaymentInstrictionsModal = useCallback(() => {
    paymentInstrictionsRef.current?.close();
  }, []);

  const {invoiceIsPending, invoice} = useSpecificInvoice(params?.id);

  const {concernsIsPending, concerns, refetch} = useGetConcerns(params?.id);

  const {onSubmit} = useRaiseConcern(
    params?.id,
    handleCloseConcernModal,
    refetch,
  );

  const handleRaiseConcern = text => {
    onSubmit(text);
  };

  const hasConcern = useMemo(
    () => !concernsIsPending && concerns?.length > 0,
    [concerns, concernsIsPending],
  );
  const isUnpaid = useMemo(
    () => invoice?.paymentStatus?.toLowerCase() === 'unpaid',
    [invoice?.paymentStatus],
  );
  const isPartiallyPaid = useMemo(
    () => invoice?.paymentStatus?.toLowerCase() === 'paid_partially',
    [invoice?.paymentStatus],
  );

  const isInactive = useMemo(() => {
    return invoice?.currentStatus?.toLowerCase() === 'inactive';
  }, [invoice?.currentStatus]);

  const status = useMemo(
    () =>
      invoice?.paymentStatus?.toLowerCase() === 'unpaid'
        ? 'unpaid'
        : invoice?.paymentStatus?.toLowerCase() === 'paid_partially'
        ? 'partiallyPaid'
        : invoice?.paymentStatus?.toLowerCase() === 'paid' && 'paid',
    [invoice?.paymentStatus],
  );

  return (
    <>
      {!invoiceIsPending && (
        <Layout ClassName={'relative'}>
          <InvoiceHeader
            invoiceAmount={numberConverter(invoice?.dueAmount)}
            invoiceTitle={invoice?.propertyName?.split('-')[0]}
            invoiceUnit={invoice?.propertyName?.split('-')[1]}
            hasConcern={hasConcern}
            isPartial={isPartiallyPaid}
            invoiceNo={invoice?.invoiceNumber}
            userInvoiced={invoice?.billedTo}
            invoiceDate={moment(invoice?.updatedAt).format('Do MMM, YYYY')}
          />

          {/*  Scroll section*/}
          <ScrollView className={'pt-20 px-4 z-0'}>
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
              title={'Garbage'}
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
              amt={numberWithCommas(Number(invoice?.totalAmount))}
            />

            {isPartiallyPaid ? (
              <InvoiceBillItem
                containerClassName={'py-3 border-y border-border_grey'}
                txtClassName={'font-inter'}
                title={'Partially Paid'}
                customAmt={
                  <View className={'items-center'}>
                    <Text className={'text-11 font-inter text-inactive_text '}>
                      {moment(invoice?.updatedAt).format(
                        'HH:MMa Do MMMM, YYYY',
                      )}
                    </Text>
                    <Text
                      className={'text-13 font-inter-semibold text-black mt-2'}>
                      KES. {numberWithCommas(Number(invoice?.paidAmount))}
                    </Text>
                  </View>
                }
              />
            ) : null}

            {!hasConcern && (isUnpaid || isPartiallyPaid) ? (
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
            ) : null}
            <View className={'h-20 w-full'} />
          </ScrollView>

          {!isInactive ? (
            <InvoiceFooter
              handlePrompt={handleOpenPaymentInstrictionsModal}
              hasConcern={hasConcern}
              status={status}
              handleViewReceipt={handleOpenReceiptModal}
            />
          ) : null}
        </Layout>
      )}

      <InvoiceConcernModal
        ref={concernModalRef}
        handleCloseModal={handleCloseConcernModal}
        handleRaiseConcern={handleRaiseConcern}
      />

      <InvoiceReceiptModal
        receipt={invoice}
        ref={receiptModalRef}
        handleCloseModal={handleCloseReceiptModal}
      />

      {/* <InvoicePaymentInstrictionsModal
        invoice={invoice}
        ref={paymentInstrictionsRef}
        handleCloseModal={handleClosePaymentInstrictionsModal}
      /> */}

      <PaymentInstructions
        invoice={invoice}
        ref={paymentInstrictionsRef}
        handleCloseModal={handleClosePaymentInstrictionsModal}
      />
    </>
  );
};

export default InvoiceView;
