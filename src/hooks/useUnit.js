import UnitServices from '../services/UnitServices';
import {useQuery} from '@tanstack/react-query';

export const useSpecificUnit = id => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`units/${id}`],
    queryFn: () => UnitServices.getUnit(id),
  });

  const unit = data || null;

  return {isPending, error, unit, refetch};
};
