import {useQuery} from '@tanstack/react-query';
import PropertyListingServices from '../services/PropertyListingServices';

export const usePropertyListing = () => {
  const {isPending, error, data} = useQuery({
    queryKey: ['property-listings'],
    queryFn: () => PropertyListingServices.getPropertyListings(0, 20),
  });

  const listings =
    data?.data?.filter(listing => listing.occupationStatus === 'VACANT') || [];

  return {isPending, error, listings};
};
