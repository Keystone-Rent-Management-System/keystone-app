import {useQuery} from '@tanstack/react-query';
import LeaseExpiryServices from '../services/LeaseExpiryServices';

export const useLeaseExpiry = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['lease-expiries'],
    queryFn: () => LeaseExpiryServices.getExpiringLeases(),
  });
  return {
    isPending,
    error,
    buckets: data?.buckets,
    expiring: data?.expiring ?? [],
    refetch,
  };
};
