import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import {
  WebhookApiResponse,
  WebhookAppFilter,
  WebhookFilter,
  WebhookLogItem,
  WebhookLogList,
} from "@/types/webhook-type";

export class WebhookLogService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async getList(outcome: WebhookFilter, app: WebhookAppFilter, q: string, page: number, size: number) {
    const params = new URLSearchParams({ outcome, app, page: String(page), size: String(size) });
    if (q.trim()) params.append("q", q.trim());
    const response = await axios.get<WebhookApiResponse<WebhookLogList>>(
      `${baseUrl}api/admin/webhook-logs?${params.toString()}`,
      { headers: this.headers }
    );
    return response?.data;
  }

  async getOne(id: string) {
    const response = await axios.get<WebhookApiResponse<WebhookLogItem>>(
      `${baseUrl}api/admin/webhook-logs/${id}`,
      { headers: this.headers }
    );
    return response?.data;
  }
}
