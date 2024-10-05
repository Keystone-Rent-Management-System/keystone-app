import {ToastAndroid} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import AgreementServices from '../services/AgreementServices';
import {getError} from '../utils/getError';
import {IAgreement} from '../types/agreement';

export const useAgrement = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['agreements'],
    queryFn: () => AgreementServices.getAgreements(0, 20),
  });

  const agreements = data?.content ?? [];

  return {isPending, error, agreements, refetch};
};

export const useActiveAgrement = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['active_agreement'],
    queryFn: () => AgreementServices.getActiveAgreement(),
  });

  const agreement = data ?? null;

  return {
    isPending,
    error,
    agreement: agreement as IAgreement,
    agreementRefetch: refetch,
  };
};

export const useAcceptAgrement = (dismiss: any, refetch: any) => {
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

  const handleAcceptAgreement = (id: string) => {
    acceptAgrementMutation.mutate(id);
  };

  return {acceptAgrementMutation, handleAcceptAgreement};
};

export const useSendTerminationNotice = (dismiss: any) => {
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

  const handleSendTerminationNotice = (props: any) => {
    sendTerminationMutation.mutateAsync(props);
  };

  return {handleSendTerminationNotice};
};
