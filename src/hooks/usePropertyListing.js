import {useQuery} from '@tanstack/react-query';
import PropertyListingServices from '../services/PropertyListingServices';

export const usePropertyListing = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['property-listings'],
    queryFn: () => PropertyListingServices.getPropertyListings(0, 20),
  });

  const listings = data?.data || [];

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
