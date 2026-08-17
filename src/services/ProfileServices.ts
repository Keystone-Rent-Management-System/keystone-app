import AxiosUtility from './AxiosServices';
import {blockedInFixtureMode} from './fixtureGuard';

/**
 * Updates user phone number
 * @param {string} newPhoneNumber
 * @returns {Promise<any>}
 */
const updatePhoneNumber = async (newPhoneNumber: string): Promise<any> => {
  const blocked = blockedInFixtureMode('PUT /manage-profile/phone');
  if (blocked) return blocked;


  const {data: res} = await AxiosUtility.put(
    `/profile/user/phoneNumber?phoneNumber=${newPhoneNumber}`,
  );

  return res;
};

const ProfileServices = {
  updatePhoneNumber,
};

export default ProfileServices;
