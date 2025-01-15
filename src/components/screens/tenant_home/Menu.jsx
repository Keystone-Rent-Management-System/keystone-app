import React, {useCallback, useMemo, useRef} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {
  BillsSvg,
  CallSvg,
  ExtensionSvg,
  HelpSvg,
  InvoiceSvg,
  StatementsSvg,
} from '@/assets/icons';
import {useNavigation} from '@react-navigation/native';
import {useActiveAgrement, useHelp} from '../../../hooks';
import Helper from '../../../utils/Helper';
import {
  GeneralRepairsModal,
  GetHelpModal,
  MakeComplaintModal,
  PaymentAllocationModal,
  RequestExtensionModal,
  RequestRepairModal,
} from '../../modals';

const Menu = ({hasInactiveAgreement, handleAcceptAgreement}) => {
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

  const {isPending, agreement} = useActiveAgrement();

  const propertyContact = useMemo(
    () => agreement?.propertyUnits?.property?.propertyContacts?.phoneNumber,
    [agreement],
  );

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

  const handleCallAssistance = async () => {
    await Helper.handleCall(propertyContact);
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
                handlePress={() =>
                  hasInactiveAgreement
                    ? handleAcceptAgreement()
                    : handleNavigate(opt?.screen)
                }
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
                disabled={isPending}
                handlePress={
                  hasInactiveAgreement
                    ? handleAcceptAgreement
                    : opt.text === 'Help'
                    ? handleHelp
                    : opt.text === 'Extension'
                    ? handleOpenExtensionModal
                    : opt.text === 'Call'
                    ? handleCallAssistance
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

const MenuBtn = ({icon, text, handlePress, disabled}) => (
  <View className={'items-center'}>
    <TouchableOpacity
      className={
        'items-center justify-center h-12 w-12 rounded-full bg-white overflow-hidden'
      }
      style={styles.menuBtn}
      disabled={disabled}
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
      name: 'invoices',
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
