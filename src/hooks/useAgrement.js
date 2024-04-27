import {useQuery} from '@tanstack/react-query';
import AgreementServices from '../services/AgreementServices';

export const useAgrement = () => {
  const {isPending, error, data} = useQuery({
    queryKey: ['agreements'],
    queryFn: () => AgreementServices.getAgreements(0, 20),
  });

  const agreements = data?.data || [];

  return {isPending, error, agreements};
};

export const useSpecificAgrement = id => {
  const {isPending, error, data} = useQuery({
    queryKey: [`agreements/${id}`],
    queryFn: () => AgreementServices.getAgreement(id),
  });

  const agreement = data?.data || null;

  return {isPending, error, agreement};
};
