import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { WebhookApiResponse } from "@/types/webhook-type";
import { DepositFunding, DepositFundingMethod } from "@/types/deposit-funding-type";

/** Super admins choose how customers may fund a plan by bank transfer: their own account number, Flutterwave's payment page, or both. */
export class DepositFundingService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async get() {
    const response = await axios.get<WebhookApiResponse<DepositFunding>>(`${baseUrl}api/admin/deposit-funding`, { headers: this.headers });
    return response?.data;
  }

  async save(method: DepositFundingMethod) {
    const response = await axios.put<WebhookApiResponse<DepositFunding>>(`${baseUrl}api/admin/deposit-funding`, { method }, { headers: this.headers });
    return response?.data;
  }
}
