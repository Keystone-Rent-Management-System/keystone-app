import UnitServices from '../services/UnitServices';
import {useQuery} from '@tanstack/react-query';

export const useUnit = size => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['units'],
    queryFn: () => UnitServices.getUnits(0, size),
  });

  const units = data?.data || null;

  return {isPending, error, units, refetch};
};

export const useSpecificUnit = id => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`units/${id}`],
    queryFn: () => UnitServices.getUnit(id),
  });

  const unit = data || null;

  return {isPending, error, unit, refetch};
};
