/** One public-sector plan that still needs money (what the finance team deducts next). */
export type PayrollPlanRow = {
  customerName: string | null;
  /** The "Unique Id" of the credit-entry upload. */
  bvn: string | null;
  phoneNumber: string | null;
  staffId: string | null;
  product: string;
  /** The "Savings Type" of the credit-entry upload. */
  savingsType: string;
  planId: string;
  planName: string | null;
  status: string;
  /** Held by the plan; for a purchase, what has been paid so far. */
  received: number;
  /** The target, lock amount or purchase price; null for a SmallVest. */
  target: number | null;
  /** Savings plans waiting for the activation amount: what is still needed. Null once reached. */
  neededToActivate: number | null;
  /** What to deduct next: the "Amount" of the credit-entry upload. */
  expected: number;
  /** The "Period" of the credit-entry upload. */
  period: string;
};

export type PayrollView = "PENDING" | "ALL";
