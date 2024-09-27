import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import PropertyListingServices from '../services/PropertyListingServices';
import {getNextPageParam, returnPaginationData} from '../utils/pagination';
import React, {useCallback, useMemo} from 'react';
import {ActivityIndicator} from 'react-native';

export const usePropertyListing = () => {
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
    queryKey: ['property-listings'],
    queryFn: async ({pageParam}) =>
      PropertyListingServices.getPropertyListings(pageParam ?? 0, 5),
    initialPageParam: 0,
    getNextPageParam: props => getNextPageParam(props),
  });

  const listings = useMemo(() => returnPaginationData(data), [data]);

  const renderListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <ActivityIndicator
          style={{marginBottom: 20}}
          color={'#022374'}
          size="large"
        />
      );
    }
    return null;
  }, [isFetchingNextPage]);

  return {
    isPending,
    isRefetching,
    error,
    listings,
    totalElements: data?.totalElements,
    refetch,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    renderListFooter,
  };
};

export const useSpecificPropertyListing = id => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`property-listings/${id}`],
    queryFn: () => PropertyListingServices.getPropertyListing(id),
  });

  const listing = data || null;

  return {isPending, error, listing, refetch};
};
