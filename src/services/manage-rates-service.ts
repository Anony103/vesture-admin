import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";

export class ManageRatesService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  async createRates(payload: {
    id: string;
    savingsType: string;
    annualRate: number;
    // Both or neither. Neither = the rate applies whatever the plan's length (in days).
    minTenorDays?: number;
    maxTenorDays?: number;
    active: boolean;
  }) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
    }>(`${baseUrl}api/interest-rate/configure`, payload, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);

    return response;
  }
  async createBulkAssets(data: FormData) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
      // data : any
    }>(`${baseUrl}api/asset/admin/bulk-upload`, data, {
      headers: {
        Authorization: `Bearer ${this._token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);

    return response;
  }
  async getAllRates(
    pageSize: number,
    currentPage: number,
    searchTerm?: string
  ) {
    const api = searchTerm
      ? `${baseUrl}api/interest-rate/search/date-range?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`
      : `${baseUrl}api/interest-rate/all/paginated?page=${currentPage}&size=${pageSize}`;

    const response = await axios.get(api, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);
    return response?.data;
  }

  /** Every rate, live or not (not paged): used to prefill the form and to spot a product that has both kinds active. */
  async getAllRatesList() {
    const response = await axios.get(`${baseUrl}api/interest-rate/all`, {
      headers: { Authorization: `Bearer ${this._token}` },
    });
    return response?.data;
  }

  /** A whole new rate set for one product. It is pending until someone else approves it; nothing customers use changes before that. */
  async submitRequest(payload: {
    savingsType: string;
    mode: "ANY" | "RANGES";
    items: { minTenorDays?: number; maxTenorDays?: number; annualRate: number }[];
  }) {
    const response = await axios.post(`${baseUrl}api/interest-rate/requests`, payload, {
      headers: { Authorization: `Bearer ${this._token}` },
    });
    return response?.data;
  }

  async getRequests(status: string, currentPage: number, pageSize: number) {
    const params = new URLSearchParams({ page: String(currentPage), size: String(pageSize) });
    if (status) params.append("status", status);
    const response = await axios.get(`${baseUrl}api/interest-rate/requests?${params.toString()}`, {
      headers: { Authorization: `Bearer ${this._token}` },
    });
    return response?.data;
  }

  async decideRequest(id: string, action: "approve" | "reject" | "cancel", reason?: string) {
    const response = await axios.post(
      `${baseUrl}api/interest-rate/requests/${id}/${action}`,
      { reason },
      { headers: { Authorization: `Bearer ${this._token}` } }
    );
    return response?.data;
  }

  /** Emergency stop of one live rate: Super Admin only, immediate, reason required. */
  async switchOffRate(id: string, reason: string) {
    const response = await axios.post(
      `${baseUrl}api/interest-rate/rates/${id}/switch-off`,
      { reason },
      { headers: { Authorization: `Bearer ${this._token}` } }
    );
    return response?.data;
  }

  /** Every change to every rate, newest first (one product when savingsType is given). */
  async getRateHistory(pageSize: number, currentPage: number, savingsType?: string) {
    const params = new URLSearchParams({ page: String(currentPage), size: String(pageSize) });
    if (savingsType) params.append("savingsType", savingsType);
    const response = await axios.get(`${baseUrl}api/interest-rate/history?${params.toString()}`, {
      headers: { Authorization: `Bearer ${this._token}` },
    });
    return response?.data;
  }

  // async authorizeSingleTransfer(payload: {
  //   userCode: string;
  //   token: string;
  //   Ids: string[] | (string & any[])
  //   approve: boolean;
  // }) {
  //   const response = await axios.post<ApiResponseType<string>>(
  //     `${baseUrl}/single/nip/approve-transaction-v2`,
  //     payload,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${this._token}`,
  //       },
  //     },
  //   );
  //   return response?.data;
  // }

  // async submitSingleTransferRequest(payload: SingleTransactionPayloadType) {
  //   const response = await axios.post<ApiResponseType<string>>(
  //     `${baseUrl}/single/nip/approve-transaction-v2`,
  //     payload,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${this._token}`,
  //       },
  //     },
  //   );
  //   return response?.data;
  // }

  // async approveOrDeclineMultiple(payload: {
  //   userCode: string;
  //   token: string;
  //   Ids: string[];
  //   approve: boolean;
  // }) {
  //   const response = await axios.post(
  //     `${baseUrl}/single/nip/approve-transaction-v2`,
  //     payload,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${this._token}`,
  //       },
  //     },
  //   );
  //   return response?.data;
  // }
}
