import moment from 'moment';
import {IFlattendenedStatement} from '../types/statement';
import {IFromEndDate} from '../utils/statement';
import AxiosUtility, {setAuthToken} from './AxiosServices';

// B70 — switched from the dead Pallax `/statements/*` POJO endpoints
// to the GAAP-correct AR sub-ledger projection at
// GET /agreements/{id}/statement. See web-side commit a69248b for
// the SPA migration and docs/design/expense-cycle-us-redesign.md in
// the web repo for the design rationale.
//
// New BE shape returns the full window in a single payload:
//   { openingBalance, closingBalance, totalCharges, totalCredits,
//     entries: [{ entryDate, description, sourceType, sourceId,
//                 charge, credit, runningBalance }] }
// — instead of the legacy paged transaction stream the old endpoints
// returned. Helpers below adapt the new shape into the legacy
// IFlattendenedStatement[] that the existing screens consume so the
// migration is non-breaking at the UI layer; screens can adopt the
// richer shape (running balance, source type, opening/closing) at
// their own pace.

export interface ARStatementEntry {
  entryDate: string;
  description: string;
  sourceType: string;
  sourceId: string;
  charge: number;
  credit: number;
  runningBalance: number;
}

export interface ARStatement {
  openingBalance: number;
  closingBalance: number;
  totalCharges: number;
  totalCredits: number;
  entries: ARStatementEntry[];
}

const fetchAgreementStatement = async (
  agreementId: string,
  from?: string,
  to?: string,
): Promise<ARStatement> => {
  setAuthToken(AxiosUtility);
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  const {data: res} = await AxiosUtility.get(
    qs
      ? `/agreements/${agreementId}/statement?${qs}`
      : `/agreements/${agreementId}/statement`,
  );
  return res;
};

// Back-compat shim — same name as before so existing callers don't
// break. Returns the new full-window payload; callers reading the
// legacy shape need to migrate to `entries[]` instead.
const getStatements = async (
  agreementId: string,
  _page: number,
  _size: number,
): Promise<ARStatement> => {
  return await fetchAgreementStatement(agreementId);
};

// "Current statement" was a legacy concept that meant "the most
// recent line on the ledger". Under the AR projection model the
// closing balance is always current — callers should read
// `closingBalance` instead of treating the response as a single row.
const fetchCurrentStatement = async (
  agreementId: string,
): Promise<ARStatement> => {
  return await fetchAgreementStatement(agreementId);
};

// Adapter — flattens the AR entries into the legacy mobile
// IFlattendenedStatement[] shape so the existing transaction list +
// PDF generator screens keep working without immediate edits. New
// screens should read `entries[]` directly.
async function getFilteredStatements(
  dateRange: IFromEndDate,
  agreementId?: string,
): Promise<IFlattendenedStatement[] | []> {
  if (!agreementId) return [];
  setAuthToken(AxiosUtility);
  const startDate = moment
    .min(moment(dateRange.from), moment(dateRange.to))
    .format('YYYY-MM-DD');
  const endDate = moment
    .max(moment(dateRange.from), moment(dateRange.to))
    .format('YYYY-MM-DD');
  const statement = await fetchAgreementStatement(
    agreementId,
    startDate,
    endDate,
  );
  return statement.entries.map(
    entry =>
      ({
        timeOfDayLabel: moment(entry.entryDate).format('MMMM YYYY'),
        // Stub legacy nested shapes so existing PDF + list rendering
        // keeps working; new screens should read the AR fields above.
        statement_date: entry.entryDate,
        invoice_details: {
          rent_amount: entry.charge,
          invoice_number: entry.sourceId,
          water_fee_amount: null,
          security: null,
          garbage_fee_amount: null,
          balance: entry.runningBalance,
          penalized_amount: null,
          total_amount: entry.charge,
          created_at: entry.entryDate,
        },
        payment_details: {
          paid_amount: entry.credit,
          balance: entry.runningBalance,
          transaction_code: entry.sourceId,
          created_at: entry.entryDate,
        },
        previous_charge: {
          carried_forward: 0,
          balance: entry.runningBalance,
        },
      } as unknown as IFlattendenedStatement),
  );
}

const StatementServices = {
  fetchAgreementStatement,
  getStatements,
  fetchCurrentStatement,
  getFilteredStatements,
};

export default StatementServices;
