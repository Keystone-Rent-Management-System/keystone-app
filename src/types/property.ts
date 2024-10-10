import {IPagination} from './pagination.ts';

export interface IPropertyContacts {
  contactName: string;
  phoneNumber: string;
  email: string;
}

export interface ILandlordUser {
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

export interface ILandlord {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  modifiedBy: string | null;
  deleted: boolean;
  landlordUser: ILandlordUser;
  status: string;
}

export interface IPaymentAccount {
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
  id: string;
  createdAt: string;
  updatedAt: string;
  line: string;
  streetNumber: string;
  streetName: string;
  location: string;
  county: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Property {
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
  country: string;
  county: string;
  neighborhood: string;
  amenities: string[];
  latitude: number;
  longitude: number;
  propertyContacts: IPropertyContacts;
  landlord: ILandlord;
  merchants: any | null;
  paymentAccounts: IPaymentAccount;
  address: IAddress;
}

export interface IPropertyListing {
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
  property: Property;
}

export interface IPropertyListingResponse extends IPagination {
  data: IPropertyListing[];
}

export interface IPropertyListingSearchParams {
  houseType?: string;
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface IPropertyListingUpload {
  fileUrl: string;
}

export interface ISpecificPropertyListing {
  propertyListing: Partial<IPropertyListing>;
  propertyUploads?: IPropertyListingUpload[];
}
