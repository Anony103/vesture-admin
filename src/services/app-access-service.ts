import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { WebhookApiResponse } from "@/types/webhook-type";
import { AppAccess, AppAccessPayload, WebTesters } from "@/types/app-access-type";

/** Super admins switch the customer web app and mobile app on or off. */
export class AppAccessService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async get() {
    const response = await axios.get<WebhookApiResponse<AppAccess>>(`${baseUrl}api/admin/app-access`, { headers: this.headers });
    return response?.data;
  }

  async save(payload: AppAccessPayload) {
    const response = await axios.put<WebhookApiResponse<AppAccess>>(`${baseUrl}api/admin/app-access`, payload, { headers: this.headers });
    return response?.data;
  }

  async getTesters() {
    const response = await axios.get<WebhookApiResponse<WebTesters>>(`${baseUrl}api/admin/app-access/testers`, { headers: this.headers });
    return response?.data;
  }

  /** Replaces the whole list. */
  async saveTesters(testers: string[]) {
    const response = await axios.put<WebhookApiResponse<WebTesters>>(`${baseUrl}api/admin/app-access/testers`, { testers }, { headers: this.headers });
    return response?.data;
  }
}
