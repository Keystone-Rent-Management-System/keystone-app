import React, {useCallback, useMemo, useRef} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  InvoiceBillItem,
  InvoiceFooter,
  InvoiceHeader,
  Layout,
} from '@/components';
import {InvoiceConcernModal, InvoiceReceiptModal} from '@/components/modals';
import moment from 'moment';
import {ConsolidatedInvoicesModal} from '../../../components/modals';
import PaymentInstructions from '../../../components/modals/PaymentInstructions';
import COLORS from '../../../constants/Theme';
import {
  useGetConcerns,
  useRaiseConcern,
  useSpecificInvoice,
} from '../../../hooks';
import {formatToKES} from '../../../utils/Helper';

const InvoiceView = ({route: {params}}) => {
  const concernModalRef = useRef();
  const receiptModalRef = useRef();
  const paymentInstrictionsRef = useRef();
  const consolidatedInvoiceRef = useRef();

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

  const handleOpenConsolidatedInvoiceModal = useCallback(() => {
    consolidatedInvoiceRef.current?.expand();
  }, []);

  const handleCloseConsolidatedInvoiceModal = useCallback(() => {
    consolidatedInvoiceRef.current?.close();
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
    if (!invoice?.currentStatus) {
      return true;
    }
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

  if (invoiceIsPending) {
    return (
      <Layout ClassName={'px-3 flex-1 justify-center items-center'}>
        <ActivityIndicator color={COLORS.primary} size={50} />
        <Text className="text-primary mt-5 font-open-sauce-sans-medium">
          Loading Invoice ...
        </Text>
      </Layout>
    );
  }

  return (
    <>
      <Layout ClassName={'relative'}>
        <InvoiceHeader
          invoiceAmount={invoice?.dueAmount}
          invoiceTitle={invoice?.propertyName?.split('-')[0]}
          invoiceUnit={invoice?.propertyName?.split('-')[1]}
          hasConcern={hasConcern}
          isPartial={isPartiallyPaid}
          invoiceNo={invoice?.invoiceNumber}
          userInvoiced={invoice?.billedTo}
          invoiceDate={moment(invoice?.updatedAt).format('Do MMM, YYYY')}
        />

        {/*  Scroll section*/}
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          className={'pt-20 px-4 z-0'}>
          <InvoiceBillItem
            txtClassName={'font-open-sauce-sans text-inactive_text'}
            title={'Bill'}
            amt={'Total'}
          />
          <InvoiceBillItem
            title={'Rent'}
            amt={formatToKES(Number(invoice?.rentAmount)) ?? 0}
          />
          {invoice?.deposit ? (
            <InvoiceBillItem
              title={'Deposit'}
              amt={formatToKES(Number(invoice?.deposit)) ?? 0}
            />
          ) : null}
          <InvoiceBillItem
            title={'Water'}
            amt={formatToKES(Number(invoice?.waterFeeAmount)) ?? 0}
          />
          <InvoiceBillItem
            title={'Garbage'}
            amt={formatToKES(Number(invoice?.garbageFeeAmount)) ?? 0}
          />
          <InvoiceBillItem
            title={'Security'}
            amt={formatToKES(Number(invoice?.securityFeeAmount)) ?? 0}
          />
          <InvoiceBillItem
            title={'Penalty'}
            amt={formatToKES(Number(invoice?.penalizedAmount)) ?? 0}
          />
          <InvoiceBillItem
            title={'Consolidated Invoices'}
            customAmt={
              <InvoiceSequenceLink
                onPress={handleOpenConsolidatedInvoiceModal}
              />
            }
          />
          <InvoiceBillItem
            containerClassName={'mt-3 border-t border-gray-200 py-3'}
            txtClassName={'font-open-sauce-sans-semibold text-black text-sm'}
            title={'Total Amount'}
            amt={`${formatToKES(Number(invoice?.totalAmount))}`}
          />
          <InvoiceBillItem
            containerClassName={'border-t border-gray-200 py-3'}
            txtClassName={'font-open-sauce-sans-semibold text-black text-sm'}
            title={'Paid Amount'}
            amt={` ${formatToKES(Number(invoice?.paidAmount ?? 0))}`}
          />
          <InvoiceBillItem
            containerClassName={'border-t border-gray-200 py-3'}
            txtClassName={`font-open-sauce-sans-semibold text-sm
              ${
                parseInt(invoice?.dueAmount ?? 0, 9) > 0
                  ? 'text-red-600'
                  : 'text-green-600'
              }
              `}
            title={
              parseInt(invoice?.dueAmount ?? 0, 9) > 0 ? 'Arrears' : 'Balance'
            }
            amt={` ${formatToKES(Number(invoice?.dueAmount ?? 0))}`}
          />

          {isPartiallyPaid ? (
            <InvoiceBillItem
              containerClassName={'py-3 border-y border-border_grey'}
              txtClassName={'font-open-sauce-sans'}
              title={'Partially Paid'}
              customAmt={
                <View className={'items-center'}>
                  <Text className={'text-11 font-open-sauce-sans text-inactive_text '}>
                    {moment(invoice?.updatedAt).format('HH:MMa Do MMMM, YYYY')}
                  </Text>
                  <Text
                    className={'text-13 font-open-sauce-sans-semibold text-black mt-2'}>
                    {formatToKES(Number(invoice?.paidAmount))}
                  </Text>
                </View>
              }
            />
          ) : null}

          {!hasConcern && (isUnpaid || isPartiallyPaid) ? (
            <View>
              <Text className={'text-sm font-open-sauce-sans-semibold text-black mt-4'}>
                Does this invoice have an issue?
              </Text>

              <Text className={'font-open-sauce-sans text-xs leading-5 mt-1 text-grey_1'}>
                The invoice has a discrepancy to what you expected,{' '}
                <TouchableOpacity onPress={handleOpenConcernModal}>
                  <Text
                    className={
                      'underline text-xs text-primary font-open-sauce-sans-semibold'
                    }>
                    Raise Concern
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          ) : null}
          <View className={'h-20 w-full'} />
        </ScrollView>

        {!isInactive && status === 'unpaid' ? (
          <InvoiceFooter
            handlePrompt={handleOpenPaymentInstrictionsModal}
            hasConcern={hasConcern}
            status={status}
            handleViewReceipt={handleOpenReceiptModal}
          />
        ) : null}
      </Layout>

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
      <ConsolidatedInvoicesModal
        ref={consolidatedInvoiceRef}
        handleCloseFilter={handleCloseConsolidatedInvoiceModal}
        invoice={invoice}
      />
    </>
  );
};

export default InvoiceView;

const InvoiceSequenceLink = ({onPress, number}) => (
  <TouchableOpacity onPress={onPress}>
    <Text className="text-primary underline font-open-sauce-sans text-sm">
      Invoice Sequence{number && `(${number})`}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 30,
  },
});
