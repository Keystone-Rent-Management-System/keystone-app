import AxiosUtility from './AxiosServices';
import {blockedInFixtureMode} from './fixtureGuard';
import {isEndpointUnavailable} from './unavailable';
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
    if (isEndpointUnavailable(err)) {
      return mockFallback('owners.list', mockOwners);
    }
    throw err;
  }
};

const generateReport = async ({ownerId, period}) => {
  const blocked = blockedInFixtureMode('POST /owners/{id}/reports');
  if (blocked) return blocked;

  try {
    const {data} = await AxiosUtility.post(
      `/owners/${ownerId}/reports`,
      {period},
    );
    return data;
  } catch (err) {
    return mockFallback(`owners.${ownerId}.report`, {
      url: null,
      message: 'Statement downloads aren’t available yet.',
    });
  }
};

const emailReport = async ({ownerId, period}) => {
  const blocked = blockedInFixtureMode('POST /owners/{id}/reports/email');
  if (blocked) return blocked;

  try {
    const {data} = await AxiosUtility.post(
      `/owners/${ownerId}/reports/email`,
      {period},
    );
    return data;
  } catch (err) {
    return mockFallback(`owners.${ownerId}.email`, {
      status: 'queued',
      message: 'Emailing statements isn’t available yet.',
    });
  }
};

const OwnerServices = {
  listOwners,
  generateReport,
  emailReport,
};

export default OwnerServices;
