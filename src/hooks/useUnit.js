import UnitServices from '../services/UnitServices';
import {useQuery} from '@tanstack/react-query';

export const useUnit = size => {
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['units'],
    queryFn: () => UnitServices.getUnits(0, size),
  });

  const units = data?.content || null;

  return {
    isPending,
    isRefetching,
    error,
    units,
    totalElements: data?.page?.totalElements,
    refetch,
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
