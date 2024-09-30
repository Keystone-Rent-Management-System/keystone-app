import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import PropertyListingServices from '../services/PropertyListingServices';
import {getNextPageParam, returnPaginationData} from '../utils/pagination';
import {useCallback, useMemo, useState} from 'react';
import {IPropertyListingSearchParams} from '../types/property.ts';

export const usePropertyListing = () => {
  const [filters, setFilters] = useState<IPropertyListingSearchParams>({});

  const handleAddRemoveFilter = useCallback(
    <K extends keyof IPropertyListingSearchParams>(
      key: K,
      value: IPropertyListingSearchParams[K],
      shouldResetRest?: boolean,
    ) => {
      setFilters(prevState => {
        const newFilters = shouldResetRest ? {} : {...prevState};

        if (newFilters[key] === value) {
          delete newFilters[key];
        } else {
          newFilters[key] = value;
        }
        return newFilters;
      });
    },
    [setFilters],
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
    queryKey: ['property-listings', JSON.stringify(filters)],
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

export const useSpecificPropertyListing = (id: number) => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`property-listings/${id}`],
    queryFn: () => PropertyListingServices.getPropertyListing(id),
  });

  const listing = data || null;

  return {isPending, error, listing, refetch};
};
