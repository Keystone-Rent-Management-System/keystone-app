import {useQuery} from '@tanstack/react-query';
import StatementServices from '../services/StatementServices';
import {useEffect, useState} from 'react';

export const useStatement = () => {
  const [statements, setStatments] = useState([]);

  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['statements'],
    queryFn: () => StatementServices.getStatements(0, 20),
  });

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

  return {isPending, error, statements, refetch};
};
