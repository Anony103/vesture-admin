import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { WebhookApiResponse } from "@/types/webhook-type";
import { ProviderKind, ProviderSettingsView } from "@/types/provider-settings-type";

/** Super admins choose which BVN and SMS provider is tried first, and which after it. */
export class ProviderSettingsService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async get() {
    const response = await axios.get<WebhookApiResponse<ProviderSettingsView>>(
      `${baseUrl}api/admin/provider-settings`,
      { headers: this.headers }
    );
    return response?.data;
  }

  async save(kind: ProviderKind, order: string[]) {
    const response = await axios.put<WebhookApiResponse<ProviderSettingsView>>(
      `${baseUrl}api/admin/provider-settings`,
      { kind, order },
      { headers: this.headers }
    );
    return response?.data;
  }
}
