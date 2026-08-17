import AxiosUtility from './AxiosServices';
import {isEndpointUnavailable} from './unavailable';
import {
  USE_MOBILE_MOCKS,
  mockComplianceAlerts,
  mockComplianceAudit,
  mockFallback,
} from './mocks';

// Compliance alerts. Notice templates are sourced from the relevant
// jurisdiction's statute (e.g. RCW 59.18 for WA HB 1217) and shipped
// as static JSON server-side; the FE never interprets them. The
// landlord signs and the action is logged with timestamp to the audit
// trail. BE contract (BE_ASKS_MOBILE §10).
//
// CEO override on Strategic Playbook scope — WA is outside the
// TX/FL/GA Year-1 footprint and was approved as an exception. Other
// jurisdictions are not enabled until the playbook expands.

const listAlerts = async () => {
  if (USE_MOBILE_MOCKS)
    return mockFallback('compliance.alerts', mockComplianceAlerts);
  try {
    const {data} = await AxiosUtility.get('/compliance/alerts');
    return data;
  } catch (err) {
    if (isEndpointUnavailable(err)) {
      return mockFallback('compliance.alerts', mockComplianceAlerts);
    }
    throw err;
  }
};

// `sendNotice` REMOVED. It caught every failure and resolved with
// {status: 'simulated'}, so the mutation's onSuccess always fired and told
// the landlord "Notice sent, logged, and audit trail updated." It had no
// caller after the Compliance decision row was removed, but a swallow-and-
// simulate helper sitting in the service layer is a loaded gun: the next
// caller inherits a guaranteed false success on a legal notice. Rebuild it
// only with a real endpoint, no catch-to-success, and a server audit id.

const getAudit = async () => {
  if (USE_MOBILE_MOCKS)
    return mockFallback('compliance.audit', mockComplianceAudit);
  try {
    const {data} = await AxiosUtility.get('/compliance/audit');
    return data;
  } catch (err) {
    if (isEndpointUnavailable(err)) {
      return mockFallback('compliance.audit', mockComplianceAudit);
    }
    throw err;
  }
};

const ComplianceServices = {
  listAlerts,
  getAudit,
};

export default ComplianceServices;
