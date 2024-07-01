import {ToastAndroid} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import InvoiceServices from '../services/InvoiceServices';
import {useEffect, useState} from 'react';

export const useUnPaidInvoice = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['invoice/unpaid'],
    queryFn: () => InvoiceServices.getInvoices(0, 20, 'unpaid'),
  });

  const invoices = data?.data || [];

  return {isPending, error, invoices, refetch};
};

export const usePartiallyPaidInvoice = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['invoice/partially-paid'],
    queryFn: () => InvoiceServices.getInvoices(0, 20, 'paidPartial'),
  });

  const invoices = data?.data || [];

  return {isPending, error, invoices, refetch};
};

export const usePaidInvoice = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['invoice/paid'],
    queryFn: () => InvoiceServices.getInvoices(0, 20, 'paid'),
  });

  const invoices = data?.data || null;

  return {isPending, error, invoices, refetch};
};

export const useOverPaidInvoice = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['invoice/over-paid'],
    queryFn: () => InvoiceServices.getInvoices(0, 20, 'overpaid'),
  });

  const invoices = data?.data || [];

  return {isPending, error, invoices, refetch};
};

export const useSpecificInvoice = id => {
  const {isPending, error, data} = useQuery({
    queryKey: ['invoice'],
    queryFn: () => InvoiceServices.getInvoice(id),
  });

  const invoice = data?.data || null;

  return {invoiceIsPending: isPending, error, invoice};
};

export const useRaiseConcern = (id, handleCloseConcernModal, refetch) => {
  const raiseConcernMutation = useMutation({
    mutationKey: ['raise_concern'],
    mutationFn: data => InvoiceServices.raiseConcern(id, data),
    onSuccess: () => {
      refetch();
      handleCloseConcernModal();
      ToastAndroid.show(
        'Your concern has been sent successfully',
        ToastAndroid.SHORT,
      );
    },
    onError: err => {
      ToastAndroid.show(
        'Raising concern failed!' + err.response.data?.message,
        ToastAndroid.SHORT,
      );
    },
  });

  const onSubmit = props => {
    raiseConcernMutation.mutateAsync({description: props});
  };

  return {onSubmit};
};

export const useGetConcerns = id => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['invoice_concerns'],
    queryFn: () => InvoiceServices.getConcerns(id),
  });

  const concerns = data?.data || null;

  return {concernsIsPending: isPending, error, concerns, refetch};
};

export const useActiveInvoices = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['invoice/active'],
    queryFn: () => InvoiceServices.getActiveInvoices(0, 10, 'ACTIVE', 'Agreed'),
  });

  const activeInvoices = data?.data?.data ?? [];

  return {isPending, error, activeInvoices, refetch};
};

export const useInvoiceAnalytics = size => {
  const [statements, setStatments] = useState([]);

  const {isPending, error, data, isRefetching, refetch} = useQuery({
    queryKey: ['landlord_statements'],
    queryFn: () => InvoiceServices.getInvoiceAnalytics(0, size),
  });

  useEffect(() => {
    if (size) {
      if (!isPending) {
        let groupedData = [];
        for (let i = 0; i < data?.data?.length; i++) {
          const statement = data?.data[i];
          const property = statement?.propertyName?.split('-')[0];
          const existingProperty = groupedData.find(
            group => group?.property === property,
          );

          if (existingProperty) {
            existingProperty.data.push(statement);
          } else {
            groupedData.push({property, data: [statement]});
          }
        }
        setStatments(groupedData);
      }
      refetch();
    }
  }, [data?.data, isPending, refetch, size]);

  return {
    isPending,
    isRefetching,
    error,
    statements,
    totalElements: data?.totalElements,
    refetch,
  };
};

export const useUnitInvoiceAnalytics = (size, propertyUnitName) => {
  const {isPending, error, data, isRefetching, refetch} = useQuery({
    queryKey: ['unit_landlord_statements'],
    queryFn: () =>
      InvoiceServices.getInvoiceAnalytics(0, size, propertyUnitName),
  });

  useEffect(() => {
    if (size || propertyUnitName) {
      refetch();
    }
  }, [data?.data, isPending, propertyUnitName, refetch, size]);

  return {
    isPending,
    isRefetching,
    error,
    statements: data?.data || [],
    totalElements: data?.totalElements,
    refetch,
  };
};
