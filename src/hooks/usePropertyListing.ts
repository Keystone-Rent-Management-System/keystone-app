import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import PropertyListingServices from '../services/PropertyListingServices';
import {getNextPageParam, returnPaginationData} from '../utils/pagination';
import {useCallback, useMemo} from 'react';
import {IFilters} from '../types/property.ts';
import {useFiltersStore} from '../provider/store/filters.ts';

export const usePropertyListing = () => {
  const {addRemoveFilter, data: filters} = useFiltersStore();

  const handleAddRemoveFilter = useCallback(
    <K extends keyof IFilters>(
      key: K,
      value: IFilters[K],
      shouldResetRest?: boolean,
    ) => {
      addRemoveFilter(key, value, shouldResetRest);
    },
    [addRemoveFilter],
  );

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
    queryKey: [
      'property-listings',
      JSON.stringify(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined),
        ),
      ),
    ],
    queryFn: async ({pageParam}) =>
      PropertyListingServices.getPropertyListings(pageParam ?? 0, 5, filters),
    initialPageParam: 0,
    getNextPageParam: props => getNextPageParam(props),
  });

  const listings = useMemo(() => returnPaginationData(data), [data]);

  return {
    isPending,
    isRefetching,
    error,
    listings,
    refetch,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    handleAddRemoveFilter,
  };
};

export const useSpecificPropertyListing = (id: string) => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`property-listings/${id}`],
    queryFn: () => PropertyListingServices.getPropertyListing(id),
  });

  return {isPending, error, data: data ?? null, refetch};
};
