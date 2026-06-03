import AxiosUtility from './AxiosServices';
import {USE_MOBILE_MOCKS, mockOwners, mockFallback} from './mocks';

// Multi-owner reporting. BE today models one landlord = one entity;
// owner-level rollups need a new Owner entity + Property.ownerId
// relation. BE_ASKS_MOBILE §9 details the contract.

const listOwners = async () => {
  if (USE_MOBILE_MOCKS) return mockFallback('owners.list', mockOwners);
  try {
    const {data} = await AxiosUtility.get('/owners');
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('owners.list', mockOwners);
    }
    throw err;
  }
};

const generateReport = async ({ownerId, period}) => {
  try {
    const {data} = await AxiosUtility.post(
      `/owners/${ownerId}/reports`,
      {period},
    );
    return data;
  } catch (err) {
    return mockFallback(`owners.${ownerId}.report`, {
      url: null,
      message: 'Report export endpoint not yet shipped',
    });
  }
};

const emailReport = async ({ownerId, period}) => {
  try {
    const {data} = await AxiosUtility.post(
      `/owners/${ownerId}/reports/email`,
      {period},
    );
    return data;
  } catch (err) {
    return mockFallback(`owners.${ownerId}.email`, {
      status: 'queued',
      message: 'Email send endpoint not yet shipped',
    });
  }
};

const OwnerServices = {
  listOwners,
  generateReport,
  emailReport,
};

export default OwnerServices;
