export type StagingFundingStatus = {
  enabled: boolean;
  /** The most one funding may credit; null when the feature is off. */
  maxAmount: number | null;
  /** The Flutterwave fee a test funding carries, in percent of the amount sent (the same estimate the web uses); null when the feature is off. */
  feePercent: number | null;
};

export type StagingPendingTransfer = {
  savingsType: string;
  expectedAmount: number;
  referenceCode: string;
  expiryTime: string | null;
};

export type StagingCustomer = {
  fullName: string;
  email: string;
  walletBalance: number;
  accountNumber: string | null;
  /** Funding exactly this amount funds the plan; any other amount goes to the wallet. */
  pendingTransfer: StagingPendingTransfer | null;
};

export type StagingFundingPayload = {
  email: string;
  amount: number;
  senderName?: string;
  /** false sends the transfer with no Flutterwave fee; the server treats anything else as with a fee. */
  simulateFee?: boolean;
};

export type StagingFundingResult = {
  credited: boolean;
  outcome: string;
  message: string | null;
  creditedTo: "WALLET" | "PLAN" | null;
  /** What was sent. */
  amount: number;
  /** Flutterwave's fee on it, zero when sent without one. */
  fee: number;
  /** The part of the fee taken from the customer's credit. */
  feeTakenFromCredit: number;
  /** What the wallet or plan received. */
  creditedAmount: number;
  newWalletBalance: number | null;
  flwRef: string;
};
