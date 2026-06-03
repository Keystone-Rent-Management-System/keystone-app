import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ToastAndroid} from 'react-native';
import PayoutServices from '../services/PayoutServices';

export const usePayoutBalance = () => {
  const {isPending, data, refetch, isRefetching} = useQuery({
    queryKey: ['payouts/balance'],
    queryFn: () => PayoutServices.getBalance(),
    refetchInterval: 30 * 1000,
  });
  return {isPending, isRefetching, balance: data, refetch};
};

export const useSendToBank = () => {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['payouts/send'],
    mutationFn: amount => PayoutServices.sendToBank(amount),
    onSuccess: res => {
      ToastAndroid.show(
        `Payout sent — ${res?.status ?? 'PROCESSING'}. ETA ${res?.etaSeconds ?? 60}s`,
        ToastAndroid.LONG,
      );
      qc.invalidateQueries({queryKey: ['payouts/balance']});
      qc.invalidateQueries({queryKey: ['dashboard/daily-collection']});
    },
    onError: () => {
      ToastAndroid.show('Payout failed. Try again.', ToastAndroid.SHORT);
    },
  });
  return mutation;
};

export const useAutoPayout = () => {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['payouts/auto'],
    mutationFn: payload => PayoutServices.setAutoPayout(payload),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: ['payouts/balance']});
      ToastAndroid.show('Auto-payout updated', ToastAndroid.SHORT);
    },
  });
  return mutation;
};
