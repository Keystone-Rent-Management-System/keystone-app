export const buildQueryParams = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([, value]) => value != null && value !== undefined && value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
};
