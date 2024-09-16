import {useQuery} from '@tanstack/react-query';
import StatementServices from '../services/StatementServices';
import {useActiveAgrement} from './useAgrement';

export const useStatement = size => {
  const {agreement} = useActiveAgrement();
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['statements'],
    queryFn: () => StatementServices.getStatements(agreement?.id, 0, size),
  });

  const statements = data?.data || [];

  return {
    isPending,
    isRefetching,
    error,
    statements,
    totalElements: data?.totalElements,
    refetch,
  };
};
