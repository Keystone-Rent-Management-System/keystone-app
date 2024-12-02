import {useQuery} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import TransactionServices from '../services/TransactionServices';
import {useAuth} from './index';
import {useMonthStartAndEndDate} from './useFormatStartAndEndDate';

export const useTotalTransaction = () => {
  const {startDate, endDate} = useMonthStartAndEndDate();
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['transaction/totals'],
    queryFn: () => TransactionServices.getTotalTransactions(startDate, endDate),
  });

  return {isPending, error, totals: data, refetch};
};

export const useTenantTransaction = size => {
  const {profile} = useAuth();
  const [transactions, setTransactions] = useState([]);

  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['transactions/tenant'],
    queryFn: () =>
      TransactionServices.getTenantTransactions(0, size, profile?.userId),
  });

  useEffect(() => {
    if (!isPending) {
      let groupedData = [];
      data?.content?.forEach(item => {
        const month = new Date(item?.createdAt).toLocaleString('default', {
          month: 'long',
        });
        const existingMonth = groupedData.find(group => group.month === month);

        if (existingMonth) {
          existingMonth.data.push(item);
        } else {
          groupedData.push({month, data: [item]});
        }
      });
      setTransactions(groupedData);
    }
  }, [data?.content, isPending]);

  return {
    isPending,
    isRefetching,
    error,
    transactions,
    totalElements: data?.totalElements,
    refetch,
  };
};

export const useTransactionIn = size => {
  const [transactions, setTransactions] = useState([]);

  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['transactions/money-in'],
    queryFn: () => TransactionServices.getTransactionsIn(0, size),
  });

  useEffect(() => {
    if (size) {
      refetch();
    }
  }, [refetch, size]);

  useEffect(() => {
    if (!isPending) {
      let groupedData = [];
      data?.content?.forEach(item => {
        const month = new Date(item?.createdAt).toLocaleString('default', {
          month: 'long',
        });
        const existingMonth = groupedData.find(group => group.month === month);

        if (existingMonth) {
          existingMonth.data.push(item);
        } else {
          groupedData.push({month, data: [item]});
        }
      });
      setTransactions(groupedData);
    }
  }, [data?.content, isPending]);

  return {
    isPending,
    isRefetching,
    error,
    transactions,
    totalElements: data?.totalElements,
    refetch,
  };
};

export const useTransactionOut = size => {
  const [transactions, setTransactions] = useState([]);

  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['transactions/money-out'],
    queryFn: () => TransactionServices.getTransactionsOut(0, size),
  });

  useEffect(() => {
    if (size) {
      refetch();
    }
  }, [refetch, size]);

  useEffect(() => {
    if (!isPending) {
      let groupedData = [];
      data?.content?.forEach(item => {
        const month = new Date(item?.createdAt).toLocaleString('default', {
          month: 'long',
        });
        const existingMonth = groupedData.find(group => group.month === month);

        if (existingMonth) {
          existingMonth.data.push(item);
        } else {
          groupedData.push({month, data: [item]});
        }
      });
      setTransactions(groupedData);
    }
  }, [data?.content, isPending]);

  return {
    isPending,
    isRefetching,
    error,
    transactions,
    totalElements: data?.totalElements,
    refetch,
  };
};
