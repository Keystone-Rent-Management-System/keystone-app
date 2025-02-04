export enum Environment {
  Dev = 'dev',
  Uat = 'uat',
  Production = 'production',
}

type Domain = {
  [key in Environment]: string;
};

export const DOMAINS: Domain = {
  [Environment.Dev]: 'gateway-dev.pallax-ke.com',
  [Environment.Uat]: 'gateway-uat.pallax-ke.com',
  [Environment.Production]: 'gateway-prod.pallax-ke.com',
};

export const getBaseUrl = (env: Environment = Environment.Uat) => {
  return `https://${DOMAINS[env]}/api/v1/rms`;
};

export const queryRefetchIntervalOptions = {
  queryRefetchInterval: 1000 * 60 * 5,
  queryRefetchIntervalInBackground: true,
};
