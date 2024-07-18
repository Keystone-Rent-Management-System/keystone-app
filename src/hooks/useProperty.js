import {useQuery} from '@tanstack/react-query';
import PropertyServices from '../services/PropertyServices';

export const useProperty = size => {
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['properties'],
    queryFn: () => PropertyServices.getProperties(0, size),
  });

  const properties = data?.data || [];

  return {
    isPending,
    isRefetching,
    error,
    properties,
    totalElements: data?.totalElements,
    refetch,
  };
};

export const usePropertyUnits = (propertyId, size) => {
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: [`properties/${propertyId}/units`],
    queryFn: () => PropertyServices.getPropertyUnits(propertyId, 0, size),
  });

  const units = data?.data || [];

  return {
    isPending,
    isRefetching,
    error,
    units,
    totalElements: data?.totalElements,
    refetch,
  };
};
