import {IPropertyListing} from '../types/property.ts';
import AxiosUtility from './AxiosServices';
import {blockedInFixtureMode} from './fixtureGuard';

/**
 * make a complain
 */
const makeComplain = async (message: string) => {
  const blocked = blockedInFixtureMode('POST /complaints');
  if (blocked) return blocked;

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
  const blocked = blockedInFixtureMode('POST /general-assistance');
  if (blocked) return blocked;

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
  const blocked = blockedInFixtureMode('POST /request-repair');
  if (blocked) return blocked;

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
  const blocked = blockedInFixtureMode('POST /allocate-payments');
  if (blocked) return blocked;

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
