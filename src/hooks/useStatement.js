import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import StatementServices from '../services/StatementServices';
import {useActiveAgrement} from './useAgrement';
import {PAGINATION_LIMIT} from '../constants';
import {getNextPageParam, returnPaginationData} from '../utils/pagination';
import React, {useCallback, useMemo} from 'react';
import {ActivityIndicator} from 'react-native';

export const useStatement = size => {
  const {agreement} = useActiveAgrement();

  const {
    data,
    error,
    isError,
    isPending,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['statements'],
    queryFn: async ({pageParam}) =>
      StatementServices.getStatements(
        agreement?.id,
        pageParam ?? 0,
        PAGINATION_LIMIT,
      ),
    initialPageParam: 0,
    getNextPageParam: props => getNextPageParam(props),
  });

  const statements = useMemo(() => returnPaginationData(data), [data]);

  const renderListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return <ActivityIndicator color={'#022374'} size="large" />;
    }
    return null;
  }, [isFetchingNextPage]);

  return {
    isPending,
    isRefetching,
    error,
    statements,
    hasNextPage,
    isFetchingNextPage,
    isError,
    refetch,

    fetchNextPage,
    renderListFooter,
  };
};

export const useActiveStatement = () => {
  const {agreement} = useActiveAgrement();

  const {data, error, isError, isPending} = useQuery({
    queryKey: ['active-statement'],
    queryFn: async () => StatementServices.fetchActiveStatement(agreement?.id),
  });

  return {
    isPending,
    error,
    isError,
    activeStatement: data,
  };
};
