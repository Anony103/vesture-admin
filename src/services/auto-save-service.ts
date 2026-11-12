import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { AutoSaveApiResponse, AutoSaveDebit, AutoSaveFilter, AutoSaveList, AutoSaveType } from "@/types/auto-save-type";

/** Saving schedules (SmallVest auto-save and Target Lock schedules), and the ones that are behind or were paused. */
export class AutoSaveService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async getList(state: AutoSaveFilter, type: AutoSaveType, q: string, page: number, size: number) {
    const params = new URLSearchParams({ state, type, page: String(page), size: String(size) });
    if (q.trim()) params.append("q", q.trim());
    const response = await axios.get<AutoSaveApiResponse<AutoSaveList>>(`${baseUrl}api/admin/auto-save?${params.toString()}`, { headers: this.headers });
    return response?.data;
  }

  async getDebits(planId: string) {
    const response = await axios.get<AutoSaveApiResponse<AutoSaveDebit[]>>(`${baseUrl}api/admin/auto-save/${planId}/debits`, { headers: this.headers });
    return response?.data;
  }
}
