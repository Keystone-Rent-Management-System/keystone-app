import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * Updates user phone number
 * @param {string} newPhoneNumber
 * @returns {Promise<any>}
 */
const updatePhoneNumber = async (newPhoneNumber: string): Promise<any> => {
  setAuthToken(AxiosUtility);

  const {data: res} = await AxiosUtility.put(
    `/profile/user/phoneNumber?phoneNumber=${newPhoneNumber}`,
  );

  return res;
};

const ProfileServices = {
  updatePhoneNumber,
};

export default ProfileServices;
