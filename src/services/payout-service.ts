import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { PayoutApiResponse, PayoutFilter, PayoutList, PayoutRow } from "@/types/payout-type";

/** Plan withdrawals on their way to customers (liquidate, debit the GL, pay by Flutterwave), and sending a parked one back through. */
export class PayoutService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async getList(status: PayoutFilter, q: string, page: number, size: number) {
    const params = new URLSearchParams({ status, page: String(page), size: String(size) });
    if (q.trim()) params.append("q", q.trim());
    const response = await axios.get<PayoutApiResponse<PayoutList>>(`${baseUrl}api/admin/plan-payouts?${params.toString()}`, { headers: this.headers });
    return response?.data;
  }

  async retry(id: string) {
    const response = await axios.post<PayoutApiResponse<PayoutRow>>(`${baseUrl}api/admin/plan-payouts/${id}/retry`, {}, { headers: this.headers });
    return response?.data;
  }
}
