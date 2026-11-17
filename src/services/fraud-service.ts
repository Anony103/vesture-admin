import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import {
  FraudAlert,
  FraudAlertList,
  FraudApiResponse,
  FraudSettings,
  FraudSeverityFilter,
  FraudStatusFilter,
} from "@/types/fraud-type";

/** Fraud alerts for staff, and the limits in force. */
export class FraudService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async getList(status: FraudStatusFilter, severity: FraudSeverityFilter, q: string, page: number, size: number) {
    const params = new URLSearchParams({ status, severity, page: String(page), size: String(size) });
    if (q.trim()) params.append("q", q.trim());
    const response = await axios.get<FraudApiResponse<FraudAlertList>>(`${baseUrl}api/admin/fraud-alerts?${params.toString()}`, {
      headers: this.headers,
    });
    return response?.data;
  }

  async getSettings() {
    const response = await axios.get<FraudApiResponse<FraudSettings>>(`${baseUrl}api/admin/fraud-alerts/settings`, { headers: this.headers });
    return response?.data;
  }

  async resolve(id: string, decision: "DISMISS" | "CONFIRM", note: string) {
    const response = await axios.post<FraudApiResponse<FraudAlert>>(
      `${baseUrl}api/admin/fraud-alerts/${id}/resolve`,
      { decision, note },
      { headers: this.headers }
    );
    return response?.data;
  }
}
