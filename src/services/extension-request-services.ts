import AxiosUtility, {setAuthToken} from './AxiosServices';

/**
 * requests for rent extension
 */
const requestExtension = async (days: number): Promise<any> => {
  setAuthToken(AxiosUtility);
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
