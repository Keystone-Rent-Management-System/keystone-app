import React, { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import invoiceData, { bills } from "@/provider/invoice";
import {
  InvoiceBillItem,
  InvoiceFooter,
  InvoiceHeader,
  Layout,
} from "@/components";
import { useNavigation } from "@react-navigation/native";
import {
  InvoiceConcernModal,
  InvoicePartialPaymentModal,
  InvoicePaymentMethodModal,
  InvoiceReceiptModal,
} from "@/components/modals";
import moment from "moment";

const InvoiceView = ({ route: { params } }) => {
  const navigation = useNavigation();
  const concernModalRef = useRef();
  const receiptModalRef = useRef();
  const paymentMethodRef = useRef();
  const partialPaymentRef = useRef();

  const [concern, setConcern] = useState(null);

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

  const currentInvoice = useMemo(
    () => invoiceData[params?.type]?.find((item) => item.id === params?.id),
    [params?.id, params?.type]
  );

  const handleNavigate = (screen, options) => {
    navigation.navigate(screen, options);
  };

  const handleRaiseConcern = (text) => {
    setConcern(text);
    handleCloseConcernModal();
  };

  const hasConcern = useMemo(() => !!concern, [concern]);
  const isUnpaid = useMemo(() => params?.type === "unpaid", [params?.t]);
  const isPending = useMemo(() => params?.type === "pending", [params?.t]);
  return (
    <>
      <Layout ClassName={"relative"}>
        <InvoiceHeader
          invoiceAmount={currentInvoice.amount}
          invoiceTitle={currentInvoice.title}
          invoiceUnit={currentInvoice.unit}
          hasConcern={hasConcern}
          isPartial={currentInvoice?.isPartial}
        />

        {/*  Scroll section*/}
        <ScrollView className={"pt-20 px-4 z-0"} style={{ elevation: 0 }}>
          <InvoiceBillItem
            txtClassName={"font-inter text-inactive_text"}
            title={"Bill"}
            amt={"Total"}
          />

          {bills.map((bill, ind) => (
            <InvoiceBillItem key={ind} title={bill.title} amt={bill.amount} />
          ))}

          <InvoiceBillItem
            containerClassName={"mt-3 border-t border-gray-200 py-5"}
            txtClassName={"font-inter-semibold text-black text-13"}
            title={"Total"}
            amt={"42,000"}
          />

          {currentInvoice?.isPartial && (
            <InvoiceBillItem
              containerClassName={"py-3 border-y border-border_grey"}
              txtClassName={"font-inter"}
              title={"Partially Paid"}
              customAmt={
                <View className={"items-center"}>
                  <Text className={"text-11 font-inter text-inactive_text "}>
                    {moment().format("HH:MMA, MMM YYYY")}
                  </Text>

                  <Text
                    className={"text-13 font-inter-semibold text-black mt-2"}
                  >
                    KES. 15,000
                  </Text>
                </View>
              }
            />
          )}

          {!hasConcern && isUnpaid && (
            <View>
              <Text className={"text-sm font-inter-semibold text-black mt-4"}>
                Does this invoice have an issue?
              </Text>

              <Text className={"font-inter text-xs leading-5 mt-1 text-grey_1"}>
                The invoice has a discrepancy to what you expected,{" "}
                <TouchableOpacity onPress={handleOpenConcernModal}>
                  <Text
                    className={
                      "underline text-xs text-primary font-inter-semibold"
                    }
                  >
                    Raise Concern
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          )}
          <View className={"h-20 w-full"} />
        </ScrollView>

        {!isPending && (
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
            handleResolve={() => setConcern(null)}
            status={params?.type}
            handleViewReceipt={handleOpenReceiptModal}
          />
        )}
      </Layout>

      <InvoiceConcernModal
        ref={concernModalRef}
        handleCloseModal={handleCloseConcernModal}
        handleRaiseConcern={handleRaiseConcern}
      />

      <InvoiceReceiptModal
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
