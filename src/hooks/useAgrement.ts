import {ToastAndroid} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import AgreementServices from '../services/AgreementServices';
import {getError} from '../utils/getError';
import {IAgreement} from '../types/agreement';
import {useActiveAgreement} from '../provider/store';
import {useEffect, useMemo} from 'react';
import {queryRefetchIntervalOptions} from '../constants/general';

export const agreementsKey = ['agreements'];

export const useAgrement = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: agreementsKey,
    queryFn: () => AgreementServices.getAgreements(0, 200),
  });

  const agreements = data?.content ?? [];

  return {isPending, error, agreements, refetch};
};

export const useActiveAgrement = () => {
  const {activeAgreement, saveAgreement} = useActiveAgreement();

  const {isPending, error, data, refetch, isFetching} = useQuery({
    queryKey: ['active_agreement', activeAgreement?.id],
    queryFn: () => AgreementServices.getActiveAgreement(),
    ...queryRefetchIntervalOptions,
  });

  const agreement = activeAgreement?.id ? activeAgreement : data ?? null;

  useEffect(() => {
    if (data?.id) {
      saveAgreement(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const isAgreed = useMemo(() => {
    return (
      agreement?.status?.toLocaleLowerCase() === 'agreed' ||
      agreement?.status?.toLocaleLowerCase() === 'accepted'
    );
  }, [agreement]);

  return {
    isPending: activeAgreement?.id ? false : isPending,
    error,
    agreement: agreement as IAgreement,
    agreementRefetch: refetch,
    isFetching,
    isAgreed,
  };
};

export const useAcceptAgrement = (
  dismiss: any = () => {},
  refetch: any = () => {},
) => {
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
      ToastAndroid.show(
        'Termination notice sent successfully',
        ToastAndroid.LONG,
      );
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
