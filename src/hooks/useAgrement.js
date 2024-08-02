import {ToastAndroid} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import AgreementServices from '../services/AgreementServices';
import {getError} from '../utils/getError';

export const useAgrement = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['agreements'],
    queryFn: () => AgreementServices.getAgreements(0, 20),
  });

  const agreements = data?.data || [];

  return {isPending, error, agreements, refetch};
};

export const useActiveAgrement = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['active_agreement'],
    queryFn: () => AgreementServices.getActiveAgreement(),
  });

  const agreement = data ?? null;

  return {isPending, error, agreement, agreementRefetch: refetch};
};

export const useAcceptAgrement = (dismiss, refetch) => {
  const acceptAgrementMutation = useMutation({
    mutationKey: ['agreement_current', 'accept'],
    mutationFn: AgreementServices.acceptAgreement,
    onSuccess: () => {
      refetch();
      dismiss();
    },
    onError: err => {
      ToastAndroid.show('Accepting agreement failed ' + getError(err), 4000);
    },
  });

  const handleAcceptAgreement = id => {
    acceptAgrementMutation.mutateAsync(id);
  };

  return {handleAcceptAgreement};
};

export const useTerminateAgrement = (dismiss, refetch) => {
  const acceptAgrementMutation = useMutation({
    mutationKey: ['agreement_current', 'terminate'],
    mutationFn: AgreementServices.terminateAgreement,
    onSuccess: () => {
      refetch();
      dismiss();
    },
    onError: err => {
      ToastAndroid.show('Decline agreement failed ' + getError(err), 4000);
    },
  });

  const handleTerminateAgreement = id => {
    acceptAgrementMutation.mutateAsync(id);
  };

  return {handleTerminateAgreement};
};

export const useSendTerminationNotice = dismiss => {
  const sendTerminationMutation = useMutation({
    mutationKey: ['send_termination_notice'],
    mutationFn: AgreementServices.sendTerminationNotice,
    onSuccess: () => {
      dismiss();
    },
    onError: err => {
      ToastAndroid.show('Moving out notice failed ' + getError(err), 4000);
    },
  });

  const handleSendTerminationNotice = props => {
    sendTerminationMutation.mutateAsync(props);
  };

  return {handleSendTerminationNotice};
};
