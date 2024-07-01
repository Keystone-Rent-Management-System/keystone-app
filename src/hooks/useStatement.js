import {useQuery} from '@tanstack/react-query';
import StatementServices from '../services/StatementServices';
import {useEffect, useState} from 'react';

export const useStatement = (size, year) => {
  const [statements, setStatments] = useState([]);

  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['statements'],
    queryFn: () => StatementServices.getStatements(0, size, year),
  });

  useEffect(() => {
    if (size || year) {
      refetch();
    }
  }, [refetch, size, year]);

  useEffect(() => {
    if (!isPending) {
      let groupedData = [];
      data?.data?.forEach(item => {
        const month = new Date(item?.transactionDate).toLocaleString(
          'default',
          {
            month: 'long',
          },
        );
        const existingMonth = groupedData.find(group => group.month === month);

        if (existingMonth) {
          existingMonth.data.push(item);
        } else {
          groupedData.push({month, data: [item]});
        }
      });
      setStatments(groupedData);
    }
  }, [data?.data, isPending]);

  return {
    isPending,
    isRefetching,
    error,
    statements,
    totalElements: data?.totalElements,
    refetch,
  };
};
