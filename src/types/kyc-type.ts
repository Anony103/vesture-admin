export type KycStepName = "LIVENESS" | "NIN" | "DOCUMENT" | "ADDRESS";
export type KycStepStatus =
  | "NOT_STARTED"
  | "SUBMITTED"
  | "PENDING"
  | "VERIFIED"
  | "FAILED"
  | "ERROR"
  | "RESET";

export type KycFilter =
  | "ALL"
  | "NEEDS_ATTENTION"
  | "ADDRESS_PENDING"
  | "BANKONE_PENDING"
  | "IN_PROGRESS"
  | "COMPLETE";

export type KycCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bankOneAccountNumber: string | null;
};

export type KycListItem = KycCustomer & {
  tier: 1 | 2 | 3;
  steps: Record<KycStepName, KycStepStatus>;
  attemptsLeft: Record<KycStepName, number>;
  bankOne: { tier2: KycStepStatus; tier3: KycStepStatus };
  attention: string[];
  lastActivity: string | null;
};

export type KycListResponse = {
  content: KycListItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  counts: Record<KycFilter, number>;
};

export type KycAttempt = {
  id: string;
  step: KycStepName | "BANKONE_TIER2" | "BANKONE_TIER3";
  status: KycStepStatus;
  attempt: number | null;
  idNumber: string | null; // already masked by the server
  providerReference: string | null;
  jobId: string | null;
  confidence: number | null;
  documentId: string | null;
  failureReason: string | null;
  summary: string | null; // JSON text of what the provider said that is safe to keep
  autoRetries: number | null;
  createdOn: string;
  updatedOn: string;
};

export type KycDocumentMeta = {
  id: string;
  type: "LIVENESS_SELFIE" | "ID_DOCUMENT";
  contentType: string;
  sizeBytes: number;
  sha256: string | null;
  cloudinaryStatus: "UPLOADED" | "PENDING" | "FAILED" | null;
  cloudinaryUrl: string | null;
  createdOn: string;
};

export type KycStepSummary = {
  step: KycStepName;
  status: KycStepStatus;
  message: string | null;
  attemptsLeft: number;
  canStart: boolean;
};

export type KycDetail = {
  customer: KycCustomer;
  steps: KycStepSummary[];
  nextStep: KycStepName | null;
  tier: 1 | 2 | 3;
  bankOne: { tier2: string; tier3: string };
  ninMasked?: string;
  attempts: KycAttempt[];
  documents: KycDocumentMeta[];
};

export type KycApiResponse<T> = {
  code: number;
  status: string;
  message: string;
  data: T;
};
