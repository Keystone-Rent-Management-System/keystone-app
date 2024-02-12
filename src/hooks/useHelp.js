import {useCallback, useRef} from 'react';

const useHelp = () => {
  const getHelpRef = useRef();
  const movingOutRef = useRef();
  // const getHelpRef = useRef();
  // const getHelpRef = useRef();

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

  const handleMovingOut = () => {
    handleCloseHelpModal();
    handleOpenMovingOutModal();
  };
  const handleMakeComplaint = () => {
    console.log('Make COmplaiinnttt');
  };
  const handleRequestRepair = () => {
    console.log('Request Repairr');
  };
  const handleGeneralAssistance = () => {
    console.log('Request assistance');
  };

  return {
    getHelpRef,
    movingOutRef,
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
  };
};

export default useHelp;
