import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";

export class PremblyService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  async getBvnDetails(bvn: string) {
    const response = await axios.get<{
      message: string;
      status: string;
      code: number;
      data: Record<string, unknown> | null;
    }>(`${baseUrl}api/prembly/bvn/details`, {
      params: { bvn },
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    return response?.data;
  }
}
