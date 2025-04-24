import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import PropertyListingServices from '../services/PropertyListingServices';
import {getNextPageParam, returnPaginationData} from '../utils/pagination';
import {useCallback, useMemo, useState} from 'react';
import {IFilters} from '../types/property.ts';
import {useFiltersStore} from '../provider/store/filters.ts';
import {useDebounce} from '@uidotdev/usehooks';

export const usePropertyListing = () => {
  const {addRemoveFilter, data: filters} = useFiltersStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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
      debouncedSearchQuery,
    ],
    queryFn: async ({pageParam}) =>
      PropertyListingServices.getPropertyListings(pageParam ?? 0, 10, {
        ...filters,
        searchKeyword: debouncedSearchQuery,
      }),
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
    handleSearchChange: setSearchQuery,
  };
};

export const useSpecificPropertyListing = (id: string) => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`property-listings/${id}`],
    queryFn: () => PropertyListingServices.getPropertyListing(id),
  });

  return {isPending, error, data: data ?? null, refetch};
};
