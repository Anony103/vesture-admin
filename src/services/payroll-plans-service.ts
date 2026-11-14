import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { WebhookApiResponse } from "@/types/webhook-type";
import { PayrollPlanRow, PayrollView } from "@/types/payroll-plan-type";

/** Public-sector plans that still need money, for the finance team. */
export class PayrollPlansService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  async list(view: PayrollView) {
    const response = await axios.get<WebhookApiResponse<PayrollPlanRow[]>>(`${baseUrl}api/admin/payroll-plans`, {
      params: { view },
      headers: { Authorization: `Bearer ${this._token}` },
    });
    return response?.data;
  }
}
