import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Fetches all properties
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Property>}
 */
const getProperties = async (page, size) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/properties?page=${page}&size=${size}`,
  );

  return res;
};

/**
 * fetch property units
 * @param {number} propertyId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Unit>}
 */
const getPropertyUnits = async (propertyId, page, size) => {
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
