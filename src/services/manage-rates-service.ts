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
