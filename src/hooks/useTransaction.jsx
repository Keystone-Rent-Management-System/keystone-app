import {useQuery} from '@tanstack/react-query';
import TransactionServices from '../services/TransactionServices';

export const useTotalTransaction = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['transaction/totals'],
    queryFn: () => TransactionServices.getTotalTransactions(),
  });

  return {isPending, error, totals: data, refetch};
};
