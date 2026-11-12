import { WebhookApiResponse } from "./webhook-type";

/** The money side of Flutterwave deposits over a period, in naira. */
export type DepositFeeTotals = {
  deposits: number;
  /** What was credited to customers' wallets and plans. */
  credited: number;
  /** Flutterwave's whole fee on those deposits. */
  flutterwaveFee: number;
  /** Customers who paid the fee on top of what was credited (Flutterwave's payment page). */
  paidByCustomerOnTop: number;
  /** Taken out of the customer's credit (the customer-pays-the-fee switch). */
  chargedToCustomer: number;
  /** What came out of Vesture's settlement: what the GL needs topping up by. */
  borneByVesture: number;
};

export type DepositFeeDay = DepositFeeTotals & { date: string };

export type DepositFeeReport = {
  from: string;
  to: string;
  total: DepositFeeTotals;
  days: DepositFeeDay[];
};

export type DepositFeeApiResponse<T> = WebhookApiResponse<T>;
