import {IAgreement} from '../types/agreement';

export const DEFAULT_AGREEMENT: IAgreement = {
  id: '',
  createdAt: '',
  updatedAt: '',
  createdBy: '',
  modifiedBy: '',
  deleted: false,
  userId: '',
  status: '',
  terms: null,
  tenancyBeginningDate: '',
  rentDueDate: 0,
  daysOfTerminationNotice: 0,
  daysOfTerminationAfterAgreementBreach: 0,
  daysOfDepositRefundAfterTermination: 0,
  terminatedOn: null,
  agreementType: '',
  agreementPremises: '',
  endDate: '',
  tenants: [],
  propertyUnits: [],
};
