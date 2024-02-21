import React, { useRef } from "react";
import { Layout, ListingItem } from "../../../components";
import { FlashList } from "@shopify/flash-list";
import { invoiceStyles } from "../../home/invoice/Unpaid";
import { AgreementSvg } from "../../../assets/icons";
import COLORS from "../../../constants/Theme";
import moment from "moment/moment";
import AgreementModalSheet from "../../../components/modals/Agreement";

const Previous = () => {
  const agreementModalRef = useRef();

  const handleViewAgreement = () => {
    agreementModalRef?.current?.present();
  };

  return (
    <Layout>
      <AgreementModalSheet ref={agreementModalRef} type={"previous"} />

      <FlashList
        contentContainerStyle={invoiceStyles.list}
        data={currentAgreements}
        renderItem={({ item }) =>
          renderAgreementListItem(item, handleViewAgreement)
        }
        keyExtractor={(_, ind) => ind.toString()}
        estimatedItemSize={300}
      />
    </Layout>
  );
};

export const renderAgreementListItem = (item, handlePress = () => {}) => {
  return (
    <ListingItem
      icon={<AgreementSvg color={COLORS.primary} size={"24"} />}
      id={item?.id}
      title={item?.title}
      customDate={item?.fromDate + " - " + item?.toDate}
      unit={item?.unitName}
      amount={item?.amount}
      handlePress={handlePress}
    />
  );
};

const currentAgreements = [
  {
    id: 1,
    title: "Purple HazeApartment",
    fromDate: moment().subtract(3, "M").format("MMM YY"),
    toDate: moment().format("MMM YY"),
    unitName: "unit E304",
    amount: "110,000",
  },
  {
    id: 2,
    title: "Ruaka Arcade Homes",
    fromDate: moment().subtract(12, "M").format("MMM YY"),
    toDate: moment().format("MMM YY"),
    unitName: "unit L202",
    amount: "80,000",
  },
];

export default Previous;
