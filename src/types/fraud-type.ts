export type FraudStatus = "OPEN" | "DISMISSED" | "CONFIRMED";
export type FraudStatusFilter = "ALL" | FraudStatus;
export type FraudSeverity = "HIGH" | "MEDIUM" | "LOW";
export type FraudSeverityFilter = "ALL" | FraudSeverity;

export type FraudAlert = {
  id: string;
  createdOn: string;
  /** Which rule found it, e.g. PAYOUT_NAME_MISMATCH. */
  rule: string;
  severity: FraudSeverity;
  title: string;
  details: string | null;
  /** The customer it is about: null for something about the system. */
  userId: string | null;
  /** Name and masked email. */
  customer: string | null;
  /** While open or confirmed, this customer's withdrawals are on hold. */
  blocksWithdrawals: boolean;
  status: FraudStatus;
  reviewedBy: string | null;
  reviewedOn: string | null;
  reviewNote: string | null;
};

export type FraudAlertList = {
  content: FraudAlert[];
  totalPages: number;
  totalElements: number;
  counts: Record<FraudStatusFilter, number>;
};

export type FraudSettings = {
  /** false: nothing is refused; what would have been shows as a LOW alert. */
  enforced: boolean;
  limits: { tier: number; daily: number; monthly: number }[];
  holdHours: number;
  pinMaxFailures: number;
  pinLockMinutes: number;
};

export type FraudApiResponse<T> = {
  code: number;
  status: string;
  message: string;
  data: T;
};
