
import {useMutation, useQuery} from '@tanstack/react-query';
import InvoiceServices from '../services/InvoiceServices';
import {useEffect, useState} from 'react';
import useAuth from './useAuth';
import {toast} from '../utils/toast';

export const useUnPaidInvoice = size => {
  const {profile} = useAuth();

  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['invoice/unpaid'],
    queryFn: () =>
      InvoiceServices.getInvoices(0, size, 'UNPAID', profile?.userId),
  });

  const invoices = data?.content || [];

  return {
    isPending,
    isRefetching,
    error,
    invoices,
    totalElements: data?.totalElements,
    refetch,
  };
};

export const usePaidInvoice = size => {
  const {profile} = useAuth();
  const {isPending, isRefetching, error, data, refetch} = useQuery({
    queryKey: ['invoice/paid'],
    queryFn: () =>
      InvoiceServices.getInvoices(0, size, 'PAID', profile?.userId),
  });

  const invoices = data?.content || null;

  return {
    isPending,
    isRefetching,
    error,
    invoices,
    totalElements: data?.totalElements,
    refetch,
  };
};

export const useSpecificInvoice = id => {
  const {isPending, error, data} = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => InvoiceServices.getInvoice(id),
    enabled: !!id,
  });

  const invoice = data || null;

  return {invoiceIsPending: isPending, error, invoice};
};

export const useRaiseConcern = (id, handleCloseConcernModal, refetch) => {
  const raiseConcernMutation = useMutation({
    mutationKey: ['raise_concern'],
    mutationFn: data => InvoiceServices.raiseConcern(id, data),
    onSuccess: () => {
      refetch();
      handleCloseConcernModal();
      toast.show(
        'Your concern has been sent successfully',
        toast.SHORT,
      );
    },
    onError: err => {
      toast.show(
        'Raising concern failed!' + err.response.data?.message,
        toast.SHORT,
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
    queryKey: ['invoice_concerns', id],
    queryFn: () => InvoiceServices.getConcerns(id),
    enabled: !!id,
  });

  const concerns = data?.content || null;

  return {concernsIsPending: isPending, error, concerns, refetch};
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
        for (let i = 0; i < data?.content?.length; i++) {
          const statement = data?.content[i];
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
  }, [data?.content, isPending, refetch, size]);

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
  }, [data?.content, isPending, propertyUnitName, refetch, size]);

  return {
    isPending,
    isRefetching,
    error,
    statements: data?.content || [],
    totalElements: data?.totalElements,
    refetch,
  };
};
