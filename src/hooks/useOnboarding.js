import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import OnboardingServices from '../services/OnboardingServices';
import {useDemoOnboardingStore} from '../provider/store/demoOnboarding';

export const onboardingQueryKey = ['tenant/onboarding'];

/**
 * Tenant onboarding status.
 *
 * `error` is returned, never swallowed, and `onboarded` is true ONLY on a
 * confirmed ONBOARDED status — the same rule as compliance: an unknown
 * state must not resolve to the reassuring one. Here that means a failed
 * request keeps the tenant tabs hidden rather than opening a home the
 * server never confirmed.
 */
export const useOnboarding = () => {
  // Re-read when the demo state is switched from Account.
  const demoState = useDemoOnboardingStore(s => s.state);

  const {isPending, isRefetching, data, error, refetch, isSuccess} = useQuery({
    queryKey: [...onboardingQueryKey, demoState],
    queryFn: () => OnboardingServices.getStatus(),
  });

  return {
    isPending,
    isRefetching,
    error,
    loaded: isSuccess,
    status: data,
    onboarded: isSuccess && OnboardingServices.isOnboarded(data),
    refetch,
  };
};

/** Advance a demo step; invalidates so the checklist re-renders. */
export const useOnboardingAction = fn => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({queryKey: onboardingQueryKey}),
  });
};

export default useOnboarding;
