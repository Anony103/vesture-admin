import { WebhookApiResponse } from "./webhook-type";

/** Where a plan withdrawal is on its way to the customer: liquidate, debit the GL, pay by Flutterwave. */
export type PayoutStatus = "LIQUIDATING" | "DEBITING" | "PAYING" | "CONFIRMING" | "PAID" | "NEEDS_ATTENTION";
export type PayoutFilter = "ALL" | PayoutStatus;

export type PayoutRow = {
  id: string;
  code: string;
  status: PayoutStatus;
  planType: "SMART_LOCK" | "TARGET_SAVINGS" | "SAVE_SMALL_SMALL" | string;
  planId: string;
  planName: string | null;
  userId: string;
  customerName: string | null;
  customerEmail: string | null;
  /** What the withdrawal took out of the plan (liquidated, then debited into the GL). */
  principal: number;
  /** After tax and penalty: what leaves Vesture's Flutterwave balance in all. */
  netAmount: number;
  transferFee: number | null;
  /** What the customer's bank is sent. */
  sendAmount: number | null;
  /** The fee Flutterwave itself reported, to compare with transferFee. */
  actualFee: number | null;
  feeSource: string | null;
  liquidatedAmount: number | null;
  debitedAmount: number | null;
  payReference: string | null;
  payAttempts: number;
  debitFailures: number;
  retries: number;
  lastError: string | null;
  createdOn: string;
  stageSince: string | null;
  nextAttemptAt: string | null;
  minutesInStage: number;
};

export type PayoutList = {
  content: PayoutRow[];
  totalPages: number;
  totalElements: number;
  counts: Record<PayoutFilter, number>;
  /** Only a super admin may send a parked payout back through. */
  canRetry: boolean;
};

export type PayoutApiResponse<T> = WebhookApiResponse<T>;
