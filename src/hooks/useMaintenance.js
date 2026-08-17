import {useQuery} from '@tanstack/react-query';
import MaintenanceServices from '../services/MaintenanceServices';

// `error` is returned, not dropped — the same discipline as
// useComplianceAlerts. A failed load left `summary` undefined, the screen
// read that as an empty queue, and rendered "✓ No active requests —
// nothing needs watching." A landlord was told nothing needed attention
// because the request failed. `loaded` is the only thing that may unlock
// a reassuring message.
export const useMaintenance = () => {
  const {isPending, data, refetch, isRefetching, error, isSuccess} = useQuery({
    queryKey: ['maintenance/summary'],
    queryFn: () => MaintenanceServices.getSummary(),
    refetchInterval: 60 * 1000,
  });
  return {
    isPending,
    isRefetching,
    error,
    loaded: isSuccess,
    summary: data,
    refetch,
  };
};
