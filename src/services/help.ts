import {IPropertyListing} from '../types/property.ts';
import AxiosUtility from './AxiosServices';

/**
 * make a complain
 */
const makeComplain = async (agreementId: string, message: string) => {
  //   verify arguments
  const {data: res} = await AxiosUtility.post(`/complaints/${agreementId}`, {
    message,
  });

  return res;
};

/**
 * General assistance
 */
const generalAssistance = async (
  agreementId: string,
  message: string,
): Promise<IPropertyListing> => {
  //   verify arguments
  const {data: res} = await AxiosUtility.post(
    `/general_assistance/${agreementId}`,
    {
      message,
    },
  );

  return res;
};

/**
 * Request repair
 */
const requestRepair = async (formData: FormData) => {
  return await AxiosUtility({
    url: '/request-repair',
    method: 'POST',
    data: formData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });
};

const HelpServices = {
  makeComplain,
  generalAssistance,
  requestRepair,
};

export default HelpServices;
