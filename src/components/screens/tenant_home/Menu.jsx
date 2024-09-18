import React, {useCallback, useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {
  BillsSvg,
  InvoiceSvg,
  StatementsSvg,
  CallSvg,
  ExtensionSvg,
  HelpSvg,
} from '@/assets/icons';
import {useNavigation} from '@react-navigation/native';
import {
  GeneralRepairsModal,
  GetHelpModal,
  MakeComplaintModal,
  RequestExtensionModal,
  RequestRepairModal,
  PaymentAllocationModal,
} from '../../modals';
import {useHelp} from '../../../hooks';

const Menu = () => {
  const navigation = useNavigation();

  const extensionModalRef = useRef();
  const {
    getHelpRef,
    makeComplaintRef,
    requestRepairRef,
    generalAssistanceRef,
    paymentAllocationRef,
    handleCloseHelpModal,
    handleOpenHelpModal,
    handleMakeComplaint,
    handleRequestRepair,
    handlePaymentAllocation,
    handleGeneralAssistance,
    handleCloseMakeComplaintModal,
    handleCloseRequestRepairModal,
    handleCloseGeneralAssistanceModal,
    handleClosePaymentAllocationModal,
  } = useHelp();

  const handleOpenExtensionModal = useCallback(() => {
    extensionModalRef.current?.expand();
  }, []);

  const handleCloseExtensionModal = useCallback(() => {
    extensionModalRef.current?.close();
  }, []);

  const handleNavigate = screen => {
    if (screen?.name) {
      navigation.navigate(screen?.name);
    }
  };

  const handleHelp = () => {
    handleOpenHelpModal();
  };

  return (
    <>
      <View className={'py-8 px-4'}>
        <View>
          <Text className={'font-inter-medium text-13 text-ctext mb-3'}>
            Finance & Payments
          </Text>

          <View className={'flex-row w-full justify-between'}>
            {financeOptions.map((opt, ind) => (
              <MenuBtn
                key={ind}
                icon={opt.icon}
                text={opt.text}
                handlePress={() => handleNavigate(opt?.screen)}
              />
            ))}
          </View>
        </View>

        <View className={'mt-8'}>
          <Text className={'font-inter-medium text-13 text-ctext mb-3'}>
            Assistance
          </Text>

          <View className={'flex-row w-full justify-between'}>
            {assistance.map((opt, ind) => (
              <MenuBtn
                key={ind}
                icon={opt.icon}
                text={opt.text}
                handlePress={
                  opt.text === 'Help'
                    ? handleHelp
                    : opt.text === 'Extension'
                    ? handleOpenExtensionModal
                    : () => handleNavigate(opt?.screen)
                }
              />
            ))}
          </View>
        </View>
      </View>

      <GetHelpModal
        ref={getHelpRef}
        handleCloseModal={handleCloseHelpModal}
        handleMakeComplaint={handleMakeComplaint}
        handleRequestRepair={handleRequestRepair}
        handleGeneralAssistance={handleGeneralAssistance}
        handlePaymentAllocation={handlePaymentAllocation}
      />

      <MakeComplaintModal
        ref={makeComplaintRef}
        handleCloseModal={handleCloseMakeComplaintModal}
      />

      <RequestRepairModal
        ref={requestRepairRef}
        handleCloseModal={handleCloseRequestRepairModal}
      />

      <GeneralRepairsModal
        ref={generalAssistanceRef}
        handleCloseModal={handleCloseGeneralAssistanceModal}
      />

      <RequestExtensionModal
        ref={extensionModalRef}
        handleCloseModal={handleCloseExtensionModal}
      />

      <PaymentAllocationModal
        ref={paymentAllocationRef}
        handleCloseModal={handleClosePaymentAllocationModal}
      />
    </>
  );
};

const MenuBtn = ({icon, text, handlePress}) => (
  <View className={'items-center'}>
    <TouchableOpacity
      className={
        'items-center justify-center h-12 w-12 rounded-full bg-white overflow-hidden'
      }
      style={styles.menuBtn}
      onPress={handlePress}>
      {icon}
    </TouchableOpacity>

    <Text className={'mt-3 text-inactive_text font-inter text-xs'}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  menuBtn: {
    elevation: 2,
  },
});

export default Menu;

const financeOptions = [
  {
    icon: <InvoiceSvg />,
    text: 'Invoices',
    screen: {
      name: 'invoice_top_tabs',
    },
  },
  {
    icon: <StatementsSvg />,
    text: 'Statements',
    screen: {
      name: 'statements',
    },
  },
  {
    icon: <BillsSvg />,
    text: 'Payments',
    screen: {
      name: 'payments',
    },
  },
];

const assistance = [
  {
    icon: <CallSvg />,
    text: 'Call',
  },
  {
    icon: <HelpSvg />,
    text: 'Help',
  },
  {
    icon: <ExtensionSvg />,
    text: 'Extension',
  },
];
