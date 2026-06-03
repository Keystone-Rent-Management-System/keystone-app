import {useQuery} from '@tanstack/react-query';
import MaintenanceServices from '../services/MaintenanceServices';

export const useMaintenance = () => {
  const {isPending, data, refetch, isRefetching} = useQuery({
    queryKey: ['maintenance/summary'],
    queryFn: () => MaintenanceServices.getSummary(),
    refetchInterval: 60 * 1000,
  });
  return {isPending, isRefetching, summary: data, refetch};
};
