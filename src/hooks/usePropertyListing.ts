import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import PropertyListingServices from '../services/PropertyListingServices';
import {getNextPageParam, returnPaginationData} from '../utils/pagination';
import {useCallback, useMemo, useState} from 'react';
import {IPropertyListingSearchParams} from '../types/property.ts';

export const usePropertyListing = () => {
  const [filters, setFilters] = useState<IPropertyListingSearchParams>({});

  console.log('FILTERS CHANGED:::', filters);

  const handleSetFilters = useCallback(
    (newFilters: IPropertyListingSearchParams) => {
      console.log('NEW FILTERS ARE:::', newFilters);
      setFilters(newFilters);
    },
    [setFilters],
  );

  const handleAddRemoveFilter = useCallback(
    <K extends keyof IPropertyListingSearchParams>(
      key: K,
      value: IPropertyListingSearchParams[K],
      shouldResetRest?: boolean,
    ) => {
      setFilters(prevState => {
        const newFilters = shouldResetRest ? {} : {...prevState};
        console.log('CALLED');
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
    handleSetFilters,
  };
};

export const useSpecificPropertyListing = (id: string) => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`property-listings/${id}`],
    queryFn: () => PropertyListingServices.getPropertyListing(id),
  });

  return {isPending, error, data: data ?? null, refetch};
};
