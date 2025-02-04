import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import React, {useCallback, useMemo} from 'react';
import {ActivityIndicator} from 'react-native';

import {queryRefetchIntervalOptions} from '../constants/general';
import StatementServices from '../services/StatementServices';
import {getNextPageParam, returnPaginationData} from '../utils/pagination';
import {useActiveAgrement} from './useAgrement';

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
      StatementServices.getStatements(agreement?.id, pageParam ?? 0, 6),
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

  const {data, error, isError, isPending, isFetching, refetch} = useQuery({
    queryKey: ['active-statement'],
    queryFn: async () => StatementServices.fetchCurrentStatement(agreement?.id),
    enabled: !!agreement?.id,
    ...queryRefetchIntervalOptions,
  });

  return {
    isPending,
    isFetching,
    error,
    isError,
    activeStatement: data,
    refetch,
  };
};
