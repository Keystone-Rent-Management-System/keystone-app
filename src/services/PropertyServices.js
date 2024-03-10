import AxiosUtility from "./AxiosServices";

/**
 * Fetches all properties
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Property[]>}
 */
const getProperties = async (page, size) => {
  const { data: res } = await AxiosUtility.get(
    `/property?page=${page}&size=${size}`
  );

  return res;
};

/**
 * fetches single property
 * @param {number} propertyId
 * @returns {Promise<Property>}
 */
const getProperty = async (propertyId) => {
  const { data: res } = await AxiosUtility.get(`/property/${propertyId}`);

  return res;
};

const PropertyServices = {
  getProperties,
  getProperty,
};

export default PropertyServices;

/**
 * @typedef {{
 *   propertyName: string,
 *   address: {
 *     country: string,
 *     county: string,
 *     city: string,
 *     estate: string,
 *     postalCode: string
 *   },
 *   landCode: string|null
 * }} Property
 */
