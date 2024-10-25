import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * fetches units
 * @param {number} page
 * @param {number} size
 * @param {string} searchQuery
 * @returns {Promise<Unit[]>}
 */
const getUnits = async (page, size, searchQuery) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/search/propertyUnits?page=${page}&size=${size}${
      searchQuery ? `&searchParam=${searchQuery}` : ''
    }`,
  );

  return res;
};

/**
 * fetches single unit
 * @param {number} unitId
 * @returns {Promise<Unit>}
 */
const getUnit = async unitId => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(`/property-units/${unitId}`);

  return res;
};

const UnitServices = {
  getUnits,
  getUnit,
};

export default UnitServices;
