type INVOICE_PAYMENT_STATUS = 'PAID' | 'UNPAID';

export interface Invoice {
  id: string;
  createdAt: string;
  updatedAt: string;
  billedUserId: string;
  billedTo: string;
  propertyId: string;
  propertyUnitId: string;
  landlordId: string | null;
  merchantId: string | null;
  propertyName: string;
  invoiceNumber: string;
  rentAmount: number;
  deposit: number | null;
  waterFeeAmount: number | null;
  garbageFeeAmount: number | null;
  securityFeeAmount: number | null;
  paidAmount: number;
  dueAmount: number;
  bankName: string;
  bankMpesaPaybillNumber: string;
  accountHolderName: string;
  accountNumber: string;
  paymentStatus: INVOICE_PAYMENT_STATUS;
  currentStatus: string;
  totalAmount: number;
  invoiceItemIds?: IConsolidatedInvoice[] | [];
}

export interface IConsolidatedInvoice {
  id: string;
  created_at: Date;
  due_amount: number;
  property_name: string;
  invoice_number: string;
}

export type INVOICE_STATUS = 'PAID' | 'UNPAID' | 'ALL';
