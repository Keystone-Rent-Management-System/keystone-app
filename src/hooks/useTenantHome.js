import {useQuery} from '@tanstack/react-query';
import TenantHomeServices from '../services/TenantHomeServices';

// The tenant's rent command center. One query; refetch every 60s while
// the home tab is focused so the "due in N days" stays honest.
export const useTenantHome = () => {
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['tenant/rent-summary'],
    queryFn: () => TenantHomeServices.getRentSummary(),
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });
  return {isPending, isRefetching, error, home: data, refetch};
};

// Full payment history (receipts list).
export const useTenantPayments = () => {
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['tenant/payments'],
    queryFn: () => TenantHomeServices.getPayments(),
  });
  return {isPending, isRefetching, error, payments: data ?? [], refetch};
};

// Rent ledger (charges/credits).
export const useTenantStatement = () => {
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['tenant/statement'],
    queryFn: () => TenantHomeServices.getStatement(),
  });
  return {isPending, isRefetching, error, statement: data, refetch};
};
