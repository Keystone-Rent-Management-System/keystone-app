import {useQuery} from '@tanstack/react-query';
import PropertyServices from '../services/PropertyServices';
import {useState} from 'react';
import {useDebounce} from '@uidotdev/usehooks';

export const useProperty = size => {
  const [search, setSearch] = useState('');
  const debouncedSearchQuery = useDebounce(search, 500);

  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['properties', debouncedSearchQuery],
    queryFn: () =>
      PropertyServices.getProperties(0, size, debouncedSearchQuery),
  });

  const properties = data?.content || [];

  return {
    isPending,
    isRefetching,
    error,
    properties,
    totalElements: data?.totalElements,
    refetch,
    setSearch,
    search,
  };
};

export const usePropertyUnits = (propertyId, size) => {
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: [`properties/${propertyId}/units`],
    queryFn: () => PropertyServices.getPropertyUnits(propertyId, 0, size),
  });

  const units = data?.content || [];

  return {
    isPending,
    isRefetching,
    error,
    units,
    totalElements: data?.page?.totalElements,
    refetch,
  };
};
