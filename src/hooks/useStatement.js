import {useQuery} from '@tanstack/react-query';
import StatementServices from '../services/StatementServices';

export const useStatement = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['statements'],
    queryFn: () => StatementServices.getStatements(0, 20),
  });

  const statements = data?.data || [];

  return {isPending, error, statements, refetch};
};
