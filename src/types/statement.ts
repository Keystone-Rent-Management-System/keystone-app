export interface IInvoiceDetails {
  rent_amount: number | null;
  invoice_number: string;
  water_fee_amount: number | null;
  security: number | null;
  garbage_fee_amount: number | null;
  balance: number;
  penalized_amount: number | null;
  total_amount: number;
  created_at: string;
}

export interface IPaymentDetails {
  paid_amount: number | null;
  balance: number;
  transaction_code: string | null;
  created_at: string | null;
}

export interface IPreviousCharge {
  carried_forward: number;
  balance: number;
}

export interface ITransaction {
  user_id: string;
  statement_id: string;
  statement_date: string;
  invoice_details: IInvoiceDetails;
  payment_details: IPaymentDetails;
  previous_charge: IPreviousCharge;
}

export interface IStatement {
  timeOfDayLabel: string;
  transactions: ITransaction[];
}

export interface IFlattendenedStatement {
  timeOfDayLabel: string;
  transaction: ITransaction;
}
