import AxiosUtility from './AxiosServices';
import {blockedInFixtureMode} from './fixtureGuard';

/**
 * requests for rent extension
 */
const requestExtension = async (days: number): Promise<any> => {
  const blocked = blockedInFixtureMode('POST /extensions');
  if (blocked) return blocked;

  const {data: res} = await AxiosUtility.post('/extensions', {
    day: days,
    status: 'APPROVED',
  });
  return res;
};

const ExtensionRequestServices = {
  requestExtension,
};

export default ExtensionRequestServices;
