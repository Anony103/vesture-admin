import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";

export class ManageSavingsService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  async createAdmin(payload: { username: string; password: string }) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
    }>(`${baseUrl}user/auth/admin/register`, payload, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);

    return response;
  }

  // async getAllSavings(
  //   typeOfSavings?: string,
  //   pageSize?: number,
  //   currentPage?: number,
  //   searchTerm?: string
  // ) {
  //   const api = searchTerm
  //     ? `${baseUrl}savings/admin/${typeOfSavings}/search?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`
  //     : `${baseUrl}savings/admin/${typeOfSavings}?page=${currentPage}&size=${pageSize}`;

  //   const response = await axios.get(
  //     // `${baseUrl}savings/admin/${typeOfSavings}/search?keyword=${searchTerm}page=${currentPage}&size=${pageSize}`,
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

  async getAllSavings(
    typeOfSavings?: string,
    options?: {
      pageSize?: number;
      currentPage?: number;
      searchTerm?: string;
      dateRange?: { startDate: string; endDate: string };
    }
  ) {
    const { pageSize, currentPage, searchTerm, dateRange } = options || {};

    let api: string;

    // Priority: date range > search term > default listing
    if (dateRange?.startDate && dateRange?.endDate) {
      api = `${baseUrl}savings/admin/${typeOfSavings}/search/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&page=${currentPage}&size=${pageSize}`;
    } else if (searchTerm) {
      api = `${baseUrl}savings/admin/${typeOfSavings}/search?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`;
    } else {
      api = `${baseUrl}savings/admin/${typeOfSavings}?page=${currentPage}&size=${pageSize}`;
    }

    const response = await axios.get(api, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    console.log(response);
    return response?.data;
  }

  async getUserSavings(id ?: string) {
    // const { pageSize, currentPage, searchTerm, dateRange } = options || {};

    const api = `${baseUrl}savings/admin/user-savings/${id}`;

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
