import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";
import { ApiResponseType } from "@/types/general-type";

export class ManageAdminService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  async createAdmin(payload: {
    username: string;
    password: string;
    role: string;
    name: string
    phone: string;
    staffNumber: string;
  }) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
    }>(`${baseUrl}api/user/auth/admin/register`, payload, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);

    return response;
  }

  // async getAllAdmin(currentPage: number, pageSize: number, search: string) {
  //   const api = search
  //     ? `${baseUrl}user/all-admins/search/?keyword=${search}&page=${currentPage}&size=${pageSize}`
  //     : `${baseUrl}user/all-admins?page=${currentPage}&size=${pageSize}`;
  //   const response = await axios.get(
  //     // `${baseUrl}user/all-admins/search/?keyword=${searchTerm}?page=${currentPage}&size=${pageSize}`,
  //     api,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${this._token}`,
  //       },
  //     }
  //   );
  //   console.log(response);
  //   return response?.data;
  // }

  async getAllAdmin(options?: {
    pageSize?: number;
    currentPage?: number;
    searchTerm?: string;
    dateRange?: { startDate: string; endDate: string };
  }) {
    const { pageSize, currentPage, searchTerm, dateRange } = options || {};

    let api: string;

    // Priority: date range > search term > default listing
    if (dateRange?.startDate && dateRange?.endDate) {
      api = `${baseUrl}api/user/all-admins/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&page=${currentPage}&size=${pageSize}`;
    } else if (searchTerm) {
      api = `${baseUrl}api/user/all-admins/search/?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`;
    } else {
      api = `${baseUrl}api/user/all-admins?page=${currentPage}&size=${pageSize}`;
    }

    const response = await axios.get(api, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    console.log(response);
    return response?.data;
  }
  async updateAdmin(payload: {
    adminId: number | undefined;
    isActive: boolean | undefined;
  }) {
    const response = await axios.post<ApiResponseType<string>>(
      `${baseUrl}api/user/superadmin/status/update`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
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
