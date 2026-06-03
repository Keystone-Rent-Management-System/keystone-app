import {useQuery} from '@tanstack/react-query';
import InsuranceServices from '../services/InsuranceServices';

export const useInsurance = () => {
  const {isPending, data, refetch, isRefetching} = useQuery({
    queryKey: ['insurance/summary'],
    queryFn: () => InsuranceServices.getSummary(),
  });
  return {isPending, isRefetching, insurance: data, refetch};
};
