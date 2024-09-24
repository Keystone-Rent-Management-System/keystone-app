export const getNextPageParam = (lastPage: any) => {
  const pageLimit = parseInt(lastPage?.size, 10);
  const totalItems = parseInt(lastPage?.totalElements, 10);
  const currentPage = parseInt(lastPage?.page, 10);

  return getNextPrevPage(pageLimit, totalItems, currentPage);
};

export const returnPaginationData = (data: any) => {
  let result = [];

  if (data?.pages?.length > 0) {
    for (const obj of data?.pages) {
      if (obj?.data) {
        result.push(...obj?.data);
      } else {
        result.push(...obj);
      }
    }
  }

  return result;
};

function getNextPrevPage(
  pageLimit: number,
  totalNumberOfItems: number,
  pageNumber: number,
) {
  const currentPage = pageNumber;
  // calculate total number of pages available
  const totalPagesAvailable = Math.ceil(totalNumberOfItems / pageLimit);

  // check if current page is less than total pages available and if less, return next page
  if (currentPage < totalPagesAvailable && currentPage >= 0) {
    return currentPage + 1;
  } else {
    return;
  }
}
