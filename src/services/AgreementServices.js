import AxiosUtility, {setAuthToken} from './AxiosServices';
import RNFetchBlob from 'rn-fetch-blob';

/**
 * Fetches all agreements
 * @param {number} page
 * @param {number} size
 * @returns {Promise<{content:Agreement[],page:any}>}
 */
const getAgreements = async (page, size) => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    `/tenants/agreements?page=${page}&size=${size}`,
  );

  return res;
};

/**
 * Fetches active agreement
 * @returns {Promise<import('../types/agreement').IAgreement>}
 */
const getActiveAgreement = async token => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.get(
    '/tenants/current-active-agreement',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res;
};

/**
 * Accept agreement
 * @param {number|string} id
 * @returns {Promise<Agreement>}
 */
const acceptAgreement = async id => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.patch(`/agreements/${id}/acceptance`);

  return res;
};

/**
 * Terminate agreement
 * @param {number} id
 * @returns {Promise<Agreement>}
 */
const terminateAgreement = async id => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.patch(`/agreements/${id}/terminate`);

  return res;
};

const sendTerminationNotice = async data => {
  setAuthToken(AxiosUtility);
  const {data: res} = await AxiosUtility.post('/vacate-notice', data);

  return res;
};

const fetchPDF = async agreementId => {
  setAuthToken(AxiosUtility);

  const response = await AxiosUtility.get(
    `/agreements/${agreementId}/download`,
    {
      responseType: 'arraybuffer',
    },
  );

  const pdfBytes = response.request?._response;
  const pdfPath = `${RNFetchBlob.fs.dirs.DocumentDir}/temp.pdf`;
  await RNFetchBlob.fs.writeFile(pdfPath, pdfBytes, 'base64');

  return pdfPath;
};

const AgreementServices = {
  getAgreements,
  getActiveAgreement,
  acceptAgreement,
  terminateAgreement,
  sendTerminationNotice,
  fetchPDF,
};

/**
 * @typedef {Object} Agreement
 * @property {string} id
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} createdBy
 * @property {string} modifiedBy
 * @property {boolean} deleted
 * @property {string} userId
 * @property {string} status
 * @property {string} tenancyBeginningDate
 * @property {number} rentDueDate
 * @property {number} daysOfTerminationNotice
 * @property {number} daysOfTerminationAfterAgreementBreach
 * @property {number} daysOfDepositRefundAfterTermination
 * @property {object} tenants
 */

export default AgreementServices;
