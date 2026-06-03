import {useQuery} from '@tanstack/react-query';
import DashboardServices from '../services/DashboardServices';

// The morning command center. One query, refetch every 30s while the
// dashboard tab is focused so the "updated N mins ago" never grows
// stale enough to be embarrassing.
export const useDashboard = () => {
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['dashboard/daily-collection'],
    queryFn: () => DashboardServices.getDailyCollection(),
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  });
  return {isPending, isRefetching, error, dashboard: data, refetch};
};
