export type StagingFundingStatus = {
  enabled: boolean;
  /** The most one funding may credit; null when the feature is off. */
  maxAmount: number | null;
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
};

export type StagingFundingResult = {
  credited: boolean;
  outcome: string;
  message: string | null;
  creditedTo: "WALLET" | "PLAN" | null;
  amount: number;
  newWalletBalance: number | null;
  flwRef: string;
};
