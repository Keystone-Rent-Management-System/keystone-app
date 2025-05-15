import {WEB_URL} from '@/constants/general';

export const getRandomFromArray = <T>(arr: T[]): T => {
  if (arr.length === 0) {
    throw new Error('Array is empty');
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};

export const getFullListingWebUrl = (listingId: string) => {
  return `${WEB_URL}listing/${listingId}`;
};
