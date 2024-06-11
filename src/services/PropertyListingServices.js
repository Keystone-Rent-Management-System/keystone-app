import AxiosUtility from './AxiosServices';

/**
 * Fetches all property listings
 * @param {number} page
 * @param {number} size
 * @returns {Promise<PropertyListing[]>}
 */
const getPropertyListings = async (page, size) => {
  const {data: res} = await AxiosUtility.get(
    `/public/property-listing?page=${page}&size=${size}`,
  );

  return res;
};

/**
 * fetches single property listing
 * @param {number} propertyId
 * @returns {Promise<PropertyListing>}
 */
const getPropertyListing = async propertyId => {
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

/**
 * @typedef {Object} PropertyListing
 * @property {string} id
 * @property {string} createdAt
 * @property {string} unitName
 * @property {string} matterportUrl
 * @property {string} referenceCode
 * @property {number} deposit
 * @property {number} rent
 * @property {string} houseType
 * @property {string} numberOfBedrooms
 * @property {string} numberOfBathrooms
 * @property {boolean} balcony
 * @property {number} floorNumber
 * @property {string} squareFoot
 * @property {string} occupationStatus
 * @property {Array<string>} amenities
 * @property {object} property
 */
