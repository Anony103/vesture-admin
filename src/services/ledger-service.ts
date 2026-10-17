import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";

export type ApiBody<T> = { code: number; status: string; message: string; data: T };
export type Page<T> = { content: T[]; totalPages: number; totalElements: number; number: number };

const base = `${baseUrl}api/admin/ledger`;

/** Everything the finance team needs from the ledger: health, statements, reconciliation, corrections and tax. */
export class LedgerService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  private async get<T>(path: string, params?: Record<string, unknown>) {
    const response = await axios.get<ApiBody<T>>(`${base}${path}`, { headers: this.headers, params });
    return response.data;
  }

  private async post<T>(path: string, params?: Record<string, unknown>, body?: unknown) {
    const response = await axios.post<ApiBody<T>>(`${base}${path}`, body ?? null, { headers: this.headers, params });
    return response.data;
  }

  status = () => this.get<Record<string, unknown>>("/status");
  check = () => this.get<Record<string, unknown>[]>("/check");
  inFlight = () => this.get<Record<string, unknown>[]>("/in-flight");
  verifyIntegrity = () => this.get<Record<string, unknown>>("/verify-integrity");
  historyCheck = (days = 7) => this.get<Record<string, unknown>[]>("/history-check", { days });
  violations = (status = "OPEN", page = 1) => this.get<Page<Record<string, unknown>>>("/violations", { status, page, size: 20 });
  resolveViolation = (id: string, note: string) => this.post(`/violations/${id}/resolve`, { note });

  trialBalance = () => this.get<Record<string, unknown>>("/trial-balance");
  statement = (accountType: string, accountId: string, page = 1) =>
    this.get<Record<string, unknown>>("/statement", { accountType, accountId, page, size: 25 });

  taxSummary = () => this.get<Record<string, unknown>>("/tax");
  taxMonths = () => this.get<Record<string, unknown>[]>("/tax/months");
  taxSchedule = (month: string) => this.get<Record<string, unknown>>("/tax/schedule", { month });
  async taxScheduleCsv(month: string) {
    const response = await axios.get<Blob>(`${base}/tax/schedule`, {
      headers: this.headers, params: { month, format: "csv" }, responseType: "blob",
    });
    return response.data;
  }
  remitTax = (amount: number, reference: string, note: string) => this.post("/tax/remit", { amount, reference, note });

  async reconcile(file: File, provider: string, referenceColumn: string, amountColumn: string) {
    const form = new FormData();
    form.append("file", file);
    const response = await axios.post<ApiBody<Record<string, unknown>>>(`${base}/reconcile`, form, {
      headers: this.headers,
      params: { provider, referenceColumn: referenceColumn || undefined, amountColumn: amountColumn || undefined },
    });
    return response.data;
  }
  reconRuns = (page = 1) => this.get<Page<Record<string, unknown>>>("/reconciliation/runs", { page, size: 10 });
  reconItems = (status = "OPEN", page = 1) => this.get<Page<Record<string, unknown>>>("/reconciliation/items", { status, page, size: 20 });
  resolveReconItem = (id: string, outcome: string, note: string) => this.post(`/reconciliation/items/${id}/resolve`, { outcome, note });

  adjustments = (status: string, page = 1) => this.get<Page<Record<string, unknown>>>("/adjustments", { status: status || undefined, page, size: 20 });
  requestAdjustment = (body: Record<string, unknown>) => this.post("/adjustments", undefined, body);
  approveAdjustment = (id: string, note: string) => this.post(`/adjustments/${id}/approve`, { note });
  rejectAdjustment = (id: string, note: string) => this.post(`/adjustments/${id}/reject`, { note });

  safeguarding = () => this.get<Record<string, unknown>>("/safeguarding");
  recordBankBalance = (accountName: string, balance: number, note: string) => this.post("/bank-balances", { accountName, balance, note });
  periods = () => this.get<Record<string, unknown>[]>("/periods");
  closePeriod = (period: string) => this.post(`/periods/${period}/close`);

  openingAudit = () => this.get<Record<string, unknown>[]>("/opening-audit");
  openBalances = (acknowledgeAudit: boolean, auditNote: string) => this.post("/opening-balances", { acknowledgeAudit, auditNote });
  cutover = () => this.post("/cutover");
  rollback = () => this.post("/rollback");
}

/** The message the server sent, or a plain fallback. */
export function errorText(error: unknown): string {
  const e = error as { response?: { data?: { message?: string; data?: unknown } }; message?: string };
  return e?.response?.data?.message || e?.message || "Something went wrong";
}
