import {useQuery} from '@tanstack/react-query';
import PropertyListingServices from '../services/PropertyListingServices';

export const usePropertyListing = () => {
  const {
    isFetching: isPending,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ['property-listings'],
    queryFn: () => PropertyListingServices.getPropertyListings(0, 20),
  });

  const listings =
    data?.data?.filter(listing => listing.occupationStatus === 'VACANT') || [];

  return {isPending, error, listings, refetch};
};

export const useSpecificPropertyListing = id => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: [`property-listings/${id}`],
    queryFn: () => PropertyListingServices.getPropertyListing(id),
  });

  const listing = data || null;

  return {isPending, error, listing, refetch};
};
