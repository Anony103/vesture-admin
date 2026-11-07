import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { WebhookApiResponse } from "@/types/webhook-type";
import { AppAccess, AppAccessPayload } from "@/types/app-access-type";

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
}
