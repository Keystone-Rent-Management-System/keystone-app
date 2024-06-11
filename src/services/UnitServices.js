import AxiosUtility, {setAuthToken} from './AxiosServices';

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
  getUnit,
};

export default UnitServices;

/**
 * New unit
 * @typedef {{
 *   unitName: string,
 *   deposit: number,
 *   rent: number,
 *   houseType: string,
 *   numberOfBedrooms:number,
 *   numberOfBathrooms: number,
 *   balcony: number,
 *   floorNumber: number,
 *   squareFoot: number
 * }} Unit
 */

/**
 * Units fetch
 * @typedef {{
 *   first: boolean,
 *   last: boolean,
 *   totalPages: number,
 *   totalElements: number,
 *   numberOfElements: number,
 *   number: number,
 *   content: Unit[]
 * }} UnitsFetch
 */
