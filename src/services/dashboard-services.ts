import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";

export class DashboardService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  // async createAssetCategory(payload: {
  //   id ?: string;
  //   name ?: string;
  //   created_by ?: string;
  //   created_on ?: Date;
  // }) {
  //   const response = await axios.post<{
  //     message: string;
  //     result: string;
  //     status: string;
  //     code: number;
  //   }>(`${baseUrl}asset/admin/asset-category`, payload, {
  //     headers: {
  //       Authorization: `Bearer ${this._token}`,
  //     },
  //   });
  //   console.log(response);

  //   return response;
  // }

  async getDashboardStats() {
    const response = await axios.get(`${baseUrl}api/savings/admin/dashboard-stats`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);
    return response?.data;
  }

  async getMonthlyTransactions() {
    const response = await axios.get(`${baseUrl}api/savings/admin/monthly-transactions`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);
    return response?.data;
  }
 async getPercentageSavings(month : string) {
    const response = await axios.get(`${baseUrl}api/savings/admin/savings-percentage/${month}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);
    return response?.data;
  }

    async getCategoriesDetails(id : string | undefined ) {
    const response = await axios.get(`${baseUrl}api/asset/admin/asset-category/${id}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);
    return response?.data;
  }
}
