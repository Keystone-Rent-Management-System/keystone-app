import {useCallback, useRef} from 'react';

const useHelp = () => {
  const getHelpRef = useRef();
  const movingOutRef = useRef();
  const makeComplaintRef = useRef();
  const requestRepairRef = useRef();
  const generalAssistanceRef = useRef();

  const handleOpenHelpModal = useCallback(() => {
    getHelpRef.current?.expand();
  }, []);

  const handleCloseHelpModal = useCallback(() => {
    getHelpRef.current?.close();
  }, []);

  const handleOpenMovingOutModal = useCallback(() => {
    movingOutRef.current?.expand();
  }, []);

  const handleCloseMovingOutModal = useCallback(() => {
    movingOutRef.current?.close();
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

  const handleMovingOut = () => {
    handleCloseHelpModal();
    handleOpenMovingOutModal();
  };
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

  return {
    getHelpRef,
    movingOutRef,
    makeComplaintRef,
    requestRepairRef,
    generalAssistanceRef,
    // help modal methods
    handleOpenHelpModal,
    handleCloseHelpModal,
    handleMovingOut,
    handleMakeComplaint,
    handleRequestRepair,
    handleGeneralAssistance,
    //   moving out
    handleOpenMovingOutModal,
    handleCloseMovingOutModal,
    //   make complaint
    handleOpenMakeComplaintModal,
    handleCloseMakeComplaintModal,
    //   request repair
    handleOpenRequestRepairModal,
    handleCloseRequestRepairModal,
    //   general assistance
    handleOpenGeneralAssistanceModal,
    handleCloseGeneralAssistanceModal,
  };
};

export default useHelp;
