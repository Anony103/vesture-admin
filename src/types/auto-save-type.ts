import { WebhookApiResponse } from "./webhook-type";

/** ON = running as planned; BEHIND = the wallet was short on the last debit and it is being retried; PAUSED = the system switched it off; WAITING = not funded yet. */
export type AutoSaveState = "ON" | "BEHIND" | "PAUSED" | "WAITING";
export type AutoSaveFilter = "ALL" | AutoSaveState;
export type AutoSaveType = "ALL" | "SMALLVEST" | "TARGET_LOCK";

export type AutoSaveRow = {
  planId: string;
  planType: "SMALLVEST" | "TARGET_LOCK";
  planName: string | null;
  planStatus: string | null;
  userId: string;
  customerName: string | null;
  customerEmail: string | null;
  walletBalance: number | null;
  state: AutoSaveState;
  enabled: boolean;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  /** Each debit. */
  amount: number | null;
  /** Target Lock: the first deposit when it differs from the others. */
  firstAmount: number | null;
  /** Target Lock: what the plan is saving towards. */
  target: number | null;
  saved: number | null;
  startDate: string | null;
  nextDate: string | null;
  lastDebitDate: string | null;
  misses: number;
  pausedReason: string | null;
  awaitingInitialUntil: string | null;
  debitsTaken: number;
  totalDebited: number;
};

export type AutoSaveList = {
  content: AutoSaveRow[];
  totalPages: number;
  totalElements: number;
  counts: Record<AutoSaveFilter, number>;
};

export type AutoSaveDebit = {
  id: string;
  planId: string;
  dueDate: string;
  amount: number;
  reference: string;
  createdOn: string;
};

export type AutoSaveApiResponse<T> = WebhookApiResponse<T>;
