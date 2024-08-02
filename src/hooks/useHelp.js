import {useCallback, useRef} from 'react';

const useHelp = () => {
  const getHelpRef = useRef();
  const makeComplaintRef = useRef();
  const requestRepairRef = useRef();
  const generalAssistanceRef = useRef();
  const paymentAllocationRef = useRef();

  const handleOpenHelpModal = useCallback(() => {
    getHelpRef.current?.expand();
  }, []);

  const handleCloseHelpModal = useCallback(() => {
    getHelpRef.current?.close();
  }, []);

  const handleOpenMakeComplaintModal = useCallback(() => {
    makeComplaintRef.current?.expand();
  }, []);

  const handleCloseMakeComplaintModal = useCallback(() => {
    makeComplaintRef.current?.close();
  }, []);

  const handleOpenRequestRepairModal = useCallback(() => {
    requestRepairRef.current?.expand();
  }, []);

  const handleCloseRequestRepairModal = useCallback(() => {
    requestRepairRef.current?.close();
  }, []);

  const handleOpenGeneralAssistanceModal = useCallback(() => {
    generalAssistanceRef.current?.expand();
  }, []);

  const handleCloseGeneralAssistanceModal = useCallback(() => {
    generalAssistanceRef.current?.close();
  }, []);

  const handleOpenPaymentAllocationModal = useCallback(() => {
    paymentAllocationRef.current?.expand();
  }, []);

  const handleClosePaymentAllocationModal = useCallback(() => {
    paymentAllocationRef.current?.close();
  }, []);

  const handleMakeComplaint = () => {
    handleCloseHelpModal();
    handleOpenMakeComplaintModal();
  };
  const handleRequestRepair = () => {
    handleCloseHelpModal();
    handleOpenRequestRepairModal();
  };
  const handleGeneralAssistance = () => {
    handleCloseHelpModal();
    handleOpenGeneralAssistanceModal();
  };

  const handlePaymentAllocation = () => {
    handleCloseHelpModal();
    handleOpenPaymentAllocationModal();
  };

  return {
    getHelpRef,
    makeComplaintRef,
    requestRepairRef,
    generalAssistanceRef,
    paymentAllocationRef,
    // help modal methods
    handleOpenHelpModal,
    handleCloseHelpModal,
    handleMakeComplaint,
    handleRequestRepair,
    handleGeneralAssistance,
    handlePaymentAllocation,
    //   make complaint
    handleOpenMakeComplaintModal,
    handleCloseMakeComplaintModal,
    //   request repair
    handleOpenRequestRepairModal,
    handleCloseRequestRepairModal,
    //   general assistance
    handleOpenGeneralAssistanceModal,
    handleCloseGeneralAssistanceModal,
    //  payment allocation
    handleOpenPaymentAllocationModal,
    handleClosePaymentAllocationModal,
  };
};

export default useHelp;
