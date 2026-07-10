export type User = {
  name: string;
  email: string;
  walletBalance: number;
  address: string;
  savings: number;
  status: "active" | "inactive" | "suspended"; // Example statuses
};

export interface AssetType {
  id: number;
  name: string;
  amount: number;
  assetCategory: string;
  created_by: string;
  updated_by: string;
  created_on: string;
  updated_on: string;
  description: string;
  maxTenor: number;
  availableUnits: number;
  initialAmount: number | null;
  imagePath: string | null;
  imageUrl: string |  null;

}
export interface RateType {
  id: string;
  savingsType: string;
  annualRate: number;
  createdBy: string;
  createdOn: string;
  updatedOn: string;
  active: boolean;
}

export interface AssetCategory {
  id: string;
  name: string;
  created_by: string;
  updated_by: string | null;
  // assets: any;
  created_on: string;
  updated_on: string;
}
export type Transaction = {
  id: string;
  userId: string;
  savingsId: string | null;

  bankCode: string | null;
  bankName: string | null;
  accountNumber: string | null;

  userFullName: string | null;
  beneficiaryName: string | null;
  beneficiaryAccountNumber: string | null;

  amount: number;
  transactionReference: string;
  transactionStatus: string;
  transactionType: string;
  transactionReason: string;
  transactionDate: string;

  created_on: string;
  updated_on: string;
};

export type SavingsType = {
  id: string;
  user: string;
  name: string;
  product: {
    id: string;
    productName: string;
    productCode: string;
    created_on: string;
    updated_on: string;
  };
  tenor: string | null;
  amount: number;
  status: string;
};
export type LogEntry = {
  id: string;
  userId: string | null;
  username: string | null;

  action: string;
  requestPayload: string | null;
  responsePayload: string | null;

  endpointResource: string | null;
  httpMethod: string | null;
  responseStatus: number | null;
  executionTimeMs: number | null;

  ipAddress: string | null;
  userAgent: string | null;
  device: string | null;
  channel: string | null;

  correlationId: string | null;
  success: boolean;
  errorMessage: string | null;

  createdOn: string;
};

export interface Savings {
  id: string;
  name: string;
  amount: number;
  newBalance: number;
  savingsType: string;
  status: string;
  createdDate: string;
  processedBy: string;
  userId: string;
  bvn: string | null;
}

export type EmployeeRecord = {
  id: string;
  ippisNumber: string;
  staffId: string;
  fullName: string;
  employerOrganization: string;
  employmentStatus: "Active" | "Inactive" | string;
  assignmentStatus: string;
  hireDate: string; // Excel serial date
  birthDate: string; // Excel serial date
  jobTitle: string;
  command: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  staffCategory: string;
  employeeType: string;
  netPay: number;
  period: string; // Excel serial date
  uploadedOn: string; // ISO date
};

export type LmsRecordStatus = "PENDING" | "TREATED";
export type LmsTransferStatus = "PENDING" | "SUCCESSFUL" | "FAILED";
export type LmsPaymentProvider = "PROVIDUS" | "BANKONE";

export interface LmsTransferInstruction {
  id: string;
  lmsReferenceId: string;
  customerName: string;
  amount: number;
  providusBankCode: string | null;
  bankoneBankCode: string | null;
  bankName: string | null;
  accountNumber: string;
  loanAccountNumber: string | null;
  bankOneCustomerId: string | null;
  narration: string | null;
  transactionReference: string | null;
  providerUsed: LmsPaymentProvider | null;
  status: LmsRecordStatus;
  transferStatus: LmsTransferStatus;
  failureReason: string | null;
  webhookSent: boolean;
  webhookSentAt: string | null;
  webhookResponse: string | null;
  treatedOn: string | null;
  createdOn: string | null;
  updatedOn: string | null;
}

// One row per provider; exactly one row is active at a time.
export interface LmsTransferConfig {
  id?: string;
  provider: LmsPaymentProvider;
  sourceAccount: string | null;
  active: boolean;
  createdOn?: string | null;
  updatedOn?: string | null;
}

export interface LmsTransferConfigHistory {
  id?: string;
  provider: LmsPaymentProvider;
  sourceAccount: string | null;
  active: boolean;
  changeDescription: string | null;
  changedBy: string | null;
  changedOn: string | null;
}

export interface LmsTransferReport {
  from: string | null;
  to: string | null;
  totalTransfers: number;
  successful: number;
  failed: number;
  byProvider: Record<string, number>;
  transfers: LmsTransferInstruction[];
}
