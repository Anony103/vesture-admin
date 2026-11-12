export type WebhookOutcome = "CREDITED" | "DUPLICATE" | "IGNORED" | "REFUSED" | "RETRY" | "ERROR";
export type WebhookFilter = "ALL" | WebhookOutcome;
/** The app a call is for: the same Flutterwave account also serves Travel and Rent+. OTHER is anything with a prefix nobody has told us about. */
export type WebhookApp = "VESTURE" | "TRAVEL" | "RENT_PLUS" | "OTHER";
export type WebhookAppFilter = "ALL" | WebhookApp;

export type WebhookLogItem = {
  id: string;
  createdOn: string;
  provider: string;
  /** WEBHOOK: the provider called us. CATCH_UP: we found the transfer by asking the provider. STAGING_TEST: a super admin simulated it on staging. */
  source: "WEBHOOK" | "CATCH_UP" | "STAGING_TEST";
  event: string | null;
  flwRef: string | null;
  txRef: string | null;
  app: WebhookApp;
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
  /** How many calls each app has, whatever outcome. */
  appCounts: Record<WebhookAppFilter, number>;
};

export type WebhookApiResponse<T> = {
  code: number;
  status: string;
  message: string;
  data: T;
};
