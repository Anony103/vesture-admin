import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { WebhookApiResponse } from "@/types/webhook-type";
import {
  StagingCustomer,
  StagingFundingPayload,
  StagingFundingResult,
  StagingFundingStatus,
} from "@/types/staging-funding-type";

/** Staging only: super admins fund a customer with a simulated Flutterwave transfer. */
export class StagingFundingService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async getStatus() {
    const response = await axios.get<WebhookApiResponse<StagingFundingStatus>>(
      `${baseUrl}api/admin/staging-funding/status`,
      { headers: this.headers }
    );
    return response?.data;
  }

  async getCustomer(email: string) {
    const response = await axios.get<WebhookApiResponse<StagingCustomer>>(
      `${baseUrl}api/admin/staging-funding/customer?email=${encodeURIComponent(email.trim())}`,
      { headers: this.headers }
    );
    return response?.data;
  }

  async fund(payload: StagingFundingPayload) {
    const response = await axios.post<WebhookApiResponse<StagingFundingResult>>(
      `${baseUrl}api/admin/staging-funding`,
      payload,
      { headers: this.headers }
    );
    return response?.data;
  }
}
