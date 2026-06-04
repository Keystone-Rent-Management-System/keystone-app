import AxiosUtility from './AxiosServices';
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
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('compliance.alerts', mockComplianceAlerts);
    }
    throw err;
  }
};

const sendNotice = async alertId => {
  try {
    const {data} = await AxiosUtility.post(
      `/compliance/alerts/${alertId}/send`,
    );
    return data;
  } catch (err) {
    return mockFallback(`compliance.${alertId}.send`, {
      status: 'simulated',
      message: 'Compliance dispatch endpoint not yet shipped',
    });
  }
};

const getAudit = async () => {
  if (USE_MOBILE_MOCKS)
    return mockFallback('compliance.audit', mockComplianceAudit);
  try {
    const {data} = await AxiosUtility.get('/compliance/audit');
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === undefined) {
      return mockFallback('compliance.audit', mockComplianceAudit);
    }
    throw err;
  }
};

const ComplianceServices = {
  listAlerts,
  sendNotice,
  getAudit,
};

export default ComplianceServices;
