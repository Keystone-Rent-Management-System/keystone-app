import {IPropertyListing} from '../types/property.ts';
import AxiosUtility from './AxiosServices';

/**
 * make a complain
 */
const makeComplain = async (message: string) => {
  //   verify arguments
  const {data: res} = await AxiosUtility.post('/complaints', {
    message,
  });

  return res;
};

/**
 * General assistance
 */
const generalAssistance = async (
  message: string,
): Promise<IPropertyListing> => {
  //   verify arguments
  const {data: res} = await AxiosUtility.post('/general-assistance', {
    message,
  });

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

/**
 * Allocate payments
 */
const allocatePayments = async (
  {transactionCode}: {transactionCode: string},
  formData: FormData,
) => {
  const params = new URLSearchParams();

  params.append('transactionCode', transactionCode);

  return await AxiosUtility({
    url: `/allocate-payments?${params.toString()}`,
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
