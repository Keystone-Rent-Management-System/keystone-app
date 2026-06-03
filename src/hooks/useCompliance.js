import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ToastAndroid} from 'react-native';
import ComplianceServices from '../services/ComplianceServices';

export const useComplianceAlerts = () => {
  const {isPending, data, refetch, isRefetching} = useQuery({
    queryKey: ['compliance/alerts'],
    queryFn: () => ComplianceServices.listAlerts(),
  });
  return {isPending, isRefetching, alerts: data ?? [], refetch};
};

export const useSendComplianceNotice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['compliance/send'],
    mutationFn: alertId => ComplianceServices.sendNotice(alertId),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['compliance/alerts']});
      ToastAndroid.show(
        'Notice sent, logged, and audit trail updated.',
        ToastAndroid.LONG,
      );
    },
    onError: () => {
      ToastAndroid.show(
        'Could not send notice. Try again.',
        ToastAndroid.SHORT,
      );
    },
  });
};
