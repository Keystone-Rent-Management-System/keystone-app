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
const requestRepair = async (
  {phone, transactionCode}: {phone: string; transactionCode: string},
  formData: FormData,
) => {
  const params = new URLSearchParams();
  params.append('phoneNumber', phone);
  params.append('transactionCode', transactionCode);

  return await AxiosUtility({
    url: `/request-repair?${params.toString()}`,
    method: 'POST',
    data: formData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Allocate payments
 */
const allocatePayments = async (formData: FormData) => {
  return await AxiosUtility({
    url: '/allocate-payments',
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
  allocatePayments,
};

export default HelpServices;
