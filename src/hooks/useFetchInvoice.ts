import {useCallback, useMemo} from 'react';
import {useInfiniteQuery} from '@tanstack/react-query';

import useAuth from './useAuth';
import InvoiceServices from '../services/InvoiceServices';
import {getNextPageParam, returnPaginationData} from '../utils/pagination.ts';
import {PAGINATION_LIMIT} from '../constants';
import {INVOICE_STATUS} from '../types/invoice.ts';

export const useFetchInvoice = (invoiceStatus: INVOICE_STATUS) => {
  const {profile} = useAuth();

  const invoiceQuery = useInfiniteQuery({
    queryKey: [['invoice', invoiceStatus]],
    queryFn: async ({pageParam}) =>
      InvoiceServices.getInvoices(
        pageParam,
        PAGINATION_LIMIT * 2.5, // 25
        invoiceStatus,
        profile?.userId,
      ),
    initialPageParam: 0,
    getNextPageParam: props => getNextPageParam(props),
  });

  const {data, isRefetching, isFetchingNextPage, hasNextPage, fetchNextPage} =
    invoiceQuery;

  const invoices = useMemo(() => returnPaginationData(data), [data]);

  const handleLoadMore = useCallback(async () => {
    if (!isRefetching && !isFetchingNextPage && hasNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching]);

  return {
    invoiceQuery,
    invoices,
    handleLoadMore,
  };
};
