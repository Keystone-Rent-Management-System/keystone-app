import AxiosUtility, {setAuthToken} from './AxiosServices';

interface Property {
  id: string;
  name: string;
  // Add other relevant fields
}

interface Unit {
  id: string;
  propertyId: string;
  // Add other relevant fields
}

/**
 * Fetches all properties
 * @param {number} page
 * @param {number} size
 * @param {string} searchQuery
 * @returns {Promise<Property[]>}
 */
const getProperties = async (
  page: number,
  size: number,
  searchQuery?: string,
): Promise<Property[]> => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/search/properties?page=${page}&size=${size}&searchParam=${searchQuery}`,
  );
  return res;
};

/**
 * Fetch property units
 * @param {number} propertyId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Unit[]>}
 */
const getPropertyUnits = async (
  propertyId: number,
  page: number,
  size: number,
): Promise<Unit[]> => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/properties/${propertyId}/units?page=${page}&size=${size}`,
  );
  return res;
};

const PropertyServices = {
  getProperties,
  getPropertyUnits,
};

export default PropertyServices;
