import UnitServices from '../services/UnitServices';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {useDebounce} from '@uidotdev/usehooks';

export const useUnit = size => {
  const [search, setSearch] = useState('');
  const debouncedSearchQuery = useDebounce(search, 500);

  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['units', debouncedSearchQuery],
    queryFn: () => UnitServices.getUnits(0, size, debouncedSearchQuery),
  });

  const units = data?.content || [];

  return {
    isPending,
    isRefetching,
    error,
    units,
    totalElements: data?.page?.totalElements,
    refetch,
    search,
    setSearch,
  };
};

export const useSpecificUnit = id => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`units/${id}`],
    queryFn: () => UnitServices.getUnit(id),
  });

  const unit = data || null;

  return {isPending, error, unit, refetch};
};
