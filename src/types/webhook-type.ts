export type WebhookOutcome = "CREDITED" | "DUPLICATE" | "IGNORED" | "REFUSED" | "RETRY" | "ERROR";
export type WebhookFilter = "ALL" | WebhookOutcome;

export type WebhookLogItem = {
  id: string;
  createdOn: string;
  provider: string;
  /** WEBHOOK: the provider called us. CATCH_UP: we found the transfer by asking the provider. */
  source: "WEBHOOK" | "CATCH_UP";
  event: string | null;
  flwRef: string | null;
  txRef: string | null;
  providerTransactionId: number | null;
  amount: number | null;
  currency: string | null;
  providerStatus: string | null;
  paymentType: string | null;
  customerEmail: string | null;
  hashResult: "OK" | "MISSING_HEADER" | "MISMATCH" | "SERVER_HASH_UNSET" | "NOT_APPLICABLE";
  outcome: WebhookOutcome;
  reason: string | null;
  httpStatus: number | null;
  /** Only on the single-call detail. */
  rawBody?: string | null;
};

export type WebhookLogList = {
  content: WebhookLogItem[];
  totalPages: number;
  totalElements: number;
  counts: Record<WebhookFilter, number>;
};

export type WebhookApiResponse<T> = {
  code: number;
  status: string;
  message: string;
  data: T;
};
