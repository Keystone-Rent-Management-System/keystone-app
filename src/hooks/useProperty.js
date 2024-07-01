import {useQuery} from '@tanstack/react-query';
import PropertyServices from '../services/PropertyServices';

export const useProperty = size => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['properties'],
    queryFn: () => PropertyServices.getProperties(0, size),
  });

  const properties = data?.data || [];

  return {isPending, error, properties, refetch};
};

export const usePropertyUnits = (propertyId, size) => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`properties/${propertyId}/units`],
    queryFn: () => PropertyServices.getPropertyUnits(propertyId, 0, size),
  });

  const units = data?.data || [];

  return {isPending, error, units, refetch};
};
