import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { WebhookApiResponse } from "@/types/webhook-type";
import { NetPayLimitView } from "@/types/net-pay-limit-type";

/** Super admins set the share of net pay a public-sector customer may commit per month. */
export class NetPayLimitService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async get() {
    const response = await axios.get<WebhookApiResponse<NetPayLimitView>>(`${baseUrl}api/admin/net-pay-limit`, { headers: this.headers });
    return response?.data;
  }

  async save(percent: number) {
    const response = await axios.put<WebhookApiResponse<NetPayLimitView>>(
      `${baseUrl}api/admin/net-pay-limit`,
      { percent },
      { headers: this.headers }
    );
    return response?.data;
  }
}
