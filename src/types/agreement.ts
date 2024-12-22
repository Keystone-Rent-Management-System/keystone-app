interface ITenantUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  identificationType: string;
  identificationNumber: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

interface ITenants {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  modifiedBy: string | null;
  deleted: boolean;
  tenantUser: ITenantUser;
}

interface IPropertyContacts {
  contactName: string;
  phoneNumber: string;
  email: string;
}

interface ILandlordUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  identificationType: string;
  identificationNumber: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

interface ILandlord {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  modifiedBy: string | null;
  deleted: boolean;
  user: ILandlordUser;
  userId: string | null;
  status: string;
}

interface IPaymentAccounts {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  modifiedBy: string | null;
  deleted: boolean;
  userId: string;
  bankName: string;
  bankMpesaPaybillNumber: string;
  accountHolderName: string;
  accountNumber: string;
  status: string;
}

interface IAddress {
  line?: string;
  streetNumber?: string;
  streetName?: string;
  location?: string;
  county?: string;
  country?: string;
}

interface Amenity {
  id: string;
  createdAt: string;
  name: string;
}

interface IProperty {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string | null;
  deleted: boolean;
  userId: string;
  name: string;
  description: string;
  referenceCode: string;
  address: IAddress;
  amenities: Amenity[];
  latitude: number;
  longitude: number;
  propertyContacts: IPropertyContacts;
  landlord: ILandlord;
  merchants: any | null;
  paymentAccounts: IPaymentAccounts;
}

interface IPropertyUnits {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  modifiedBy: string | null;
  deleted: boolean;
  userId: string;
  matterportUrl: string;
  name: string;
  referenceCode: string;
  deposit: number;
  rent: number;
  houseType: string;
  numberOfBedrooms: string;
  numberOfBathrooms: string;
  balcony: number;
  floorNumber: number;
  squareFoot: string;
  occupationStatus: string;
  purpose: string;
  description: string | null;
  property: IProperty;
}

export interface IAgreement {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  modifiedBy: string | null;
  deleted: boolean;
  userId: string;
  status: string;
  terms: string | null;
  tenancyBeginningDate: string;
  rentDueDate: number;
  daysOfTerminationNotice: number;
  daysOfTerminationAfterAgreementBreach: number;
  daysOfDepositRefundAfterTermination: number;
  terminatedOn: string | null;
  agreementType: string | null;
  agreementPremises: string | null;
  endDate: string | null;
  tenants: ITenants;
  propertyUnits: IPropertyUnits;
}
