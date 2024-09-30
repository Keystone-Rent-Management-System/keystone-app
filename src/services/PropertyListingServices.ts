import AxiosUtility from './AxiosServices';
import {
  IPropertyListing,
  IPropertyListingResponse,
  IPropertyListingSearchParams,
} from '../types/property.ts';

/**
 * Fetches all property listings
 * @param {number} page
 * @param {number} size
 * @param {IPropertyListingSearchParams} searchParams
 * @returns {Promise<IPropertyListingResponse[]>}
 */
const getPropertyListings = async (
  page: number,
  size: number,
  searchParams: IPropertyListingSearchParams,
): Promise<IPropertyListingResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
  }

  const {data: res} = await AxiosUtility.get(
    `/public/property-listing/search?${params.toString()}`,
  );

  return res;
};

/**
 * Fetches single property listing
 * @param {number} propertyId
 * @returns {Promise<IPropertyListing>}
 */
const getPropertyListing = async (
  propertyId: number,
): Promise<IPropertyListing> => {
  const {data: res} = await AxiosUtility.get(
    `/public/property-listing/${propertyId}`,
  );

  return res;
};

const PropertyListingServices = {
  getPropertyListings,
  getPropertyListing,
};

export default PropertyListingServices;
