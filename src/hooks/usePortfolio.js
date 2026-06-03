import {useMutation, useQuery} from '@tanstack/react-query';
import PortfolioServices from '../services/PortfolioServices';

export const usePortfolio = period => {
  const {isPending, data, refetch, isRefetching} = useQuery({
    queryKey: ['portfolio/performance', period ?? 'current'],
    queryFn: () => PortfolioServices.getPerformance(period),
  });
  return {isPending, isRefetching, performance: data, refetch};
};

export const useExportPortfolioPdf = () => {
  return useMutation({
    mutationKey: ['portfolio/performance/pdf'],
    mutationFn: period => PortfolioServices.exportPerformancePdf(period),
  });
};
