import {useCallback, useRef} from 'react';

const useHelp = () => {
  const getHelpRef = useRef();
  const movingOutRef = useRef();
  const makeComplaintRef = useRef();
  const requestRepairRef = useRef();

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
    console.log('Request assistance');
  };

  return {
    getHelpRef,
    movingOutRef,
    makeComplaintRef,
    requestRepairRef,
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
  };
};

export default useHelp;
