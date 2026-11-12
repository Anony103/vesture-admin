import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { DepositFeeApiResponse, DepositFeeReport } from "@/types/deposit-fee-type";

/** What Flutterwave charged on deposits, day by day, and how much of it Vesture bore. */
export class DepositFeeService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  /** from and to are YYYY-MM-DD, both included. */
  async getReport(from: string, to: string) {
    const params = new URLSearchParams({ from, to });
    const response = await axios.get<DepositFeeApiResponse<DepositFeeReport>>(`${baseUrl}api/admin/deposit-fees?${params.toString()}`, {
      headers: this.headers,
    });
    return response?.data;
  }
}
