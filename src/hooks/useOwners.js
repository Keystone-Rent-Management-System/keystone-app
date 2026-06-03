import {useMutation, useQuery} from '@tanstack/react-query';
import OwnerServices from '../services/OwnerServices';

export const useOwners = () => {
  const {isPending, data, refetch, isRefetching} = useQuery({
    queryKey: ['owners/list'],
    queryFn: () => OwnerServices.listOwners(),
  });
  return {isPending, isRefetching, owners: data ?? [], refetch};
};

export const useGenerateOwnerReport = () =>
  useMutation({
    mutationKey: ['owners/report'],
    mutationFn: ({ownerId, period}) =>
      OwnerServices.generateReport({ownerId, period}),
  });

export const useEmailOwnerReport = () =>
  useMutation({
    mutationKey: ['owners/email'],
    mutationFn: ({ownerId, period}) =>
      OwnerServices.emailReport({ownerId, period}),
  });
