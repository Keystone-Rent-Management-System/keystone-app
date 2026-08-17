import {useQuery} from '@tanstack/react-query';

import ComplianceServices from '../services/ComplianceServices';

// `error` is returned, not swallowed. These hooks used to collapse a
// failed load into `[]`, and an empty list is indistinguishable from
// "nothing is due" — so a 404 on the compliance endpoint rendered as
// "All notices handled · Your audit trail is current." An unknown
// compliance state must never be presented as a legal all-clear; the
// screen needs the error in order to say "we couldn't check" instead.
// `loaded` is the only thing that may unlock a reassuring message.
export const useComplianceAlerts = () => {
  const {isPending, data, refetch, isRefetching, error, isSuccess} = useQuery({
    queryKey: ['compliance/alerts'],
    queryFn: () => ComplianceServices.listAlerts(),
  });
  return {
    isPending,
    isRefetching,
    error,
    loaded: isSuccess,
    alerts: data ?? [],
    refetch,
  };
};

export const useComplianceAudit = () => {
  const {isPending, data, refetch, error, isSuccess} = useQuery({
    queryKey: ['compliance/audit'],
    queryFn: () => ComplianceServices.getAudit(),
  });
  return {isPending, error, loaded: isSuccess, audit: data ?? [], refetch};
};

// `useSendComplianceNotice` REMOVED with the service function it wrapped —
// its onSuccess announced "Notice sent, logged, and audit trail updated"
// off the back of a simulated response.
