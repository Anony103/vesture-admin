import { baseUrl } from "@/constants";
import axios from "axios";
import { ApiResponseType } from "@/types/general-type";

export class GeneralAdminService {
  protected _token: string | null = null;
  constructor(token: string) {
    this._token = token;
  }

  // async createAdmin(payload: {
  //   accountNumber: string;
  // }) {
  //   const response = await axios.post<{
  //     message: string;
  //     result: string;
  //     status: string;
  //   }>(`${baseUrl}/nip/internal_account_validation`, payload, {
  //     headers: {
  //       Authorization: `Bearer ${this._token}`,
  //     },
  //   });
  //   ////console.log(response);
  //   const formattedData = {
  //     ...response?.data,
  //     result: response?.data?.status
  //       ? (JSON.parse(response?.data?.result) as ProvidusAccountInfoType)
  //       : null,
  //   };
  //   return formattedData;
  // }
  async verifyWalletId(payload: { walletId: string }) {
    const response = await axios.post(`${baseUrl}`, payload, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    return response.data;
  }

  async getAllUsers(
    currentPage: number,
    pageSize: number,
    customerType: string,
    search?: string,
    startDate?: string,
    endDate?: string
  ) {
    const payload = {
      status: customerType,
      page: currentPage,
      size: pageSize,
      startDate: startDate,
      endDate: endDate,
    };

    const api = search
      ? `${baseUrl}api/user/all-users-by-status/search?keyword=${search}`
      : `${baseUrl}api/user/all-users-by-status`;

    const response = await axios.post(
      // `${baseUrl}user/all-users-by-status/search?keyword=${search}`,
      api,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    console.log(response);
    return response?.data;
  }
  async updateCustomer(payload: {
    userId: string | undefined;
    status: string;
  }) {
    const response = await axios.post<ApiResponseType<string>>(
      `${baseUrl}api/user/status/update`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response?.data;
  }

  // async getAllTransactions(
  //   currentPage: number,
  //   pageSize: number,
  //   search: string,
  //   startDate: string,
  //   endDate: string
  // ) {
  //   // const payload = {
  //   //   page: currentPage,
  //   //   size: pageSize,
  //   //   startDate: startDate,
  //   //   endDate: endDate,
  //   //   // status : "all"
  //   // };
  //   // const api = `${baseUrl}savings/admin/transactions/search/date-range?keyword=${search}`

  //   const response = await axios.get(
  //     `${baseUrl}savings/admin/transactions?page=${currentPage}&size=${pageSize}`
  //     // api
  //     ,
  //     // payload,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${this._token}`,
  //       },
  //     }
  //   );
  //   console.log(response);
  //   return response?.data;
  // }

  async getAllTransactions(options?: {
    pageSize?: number;
    currentPage?: number;
    searchTerm?: string;
    dateRange?: { startDate: string; endDate: string };
  }) {
    const { pageSize, currentPage, searchTerm, dateRange } = options || {};

    // Date range filter uses POST
    if (dateRange?.startDate && dateRange?.endDate) {
      const payload = {
        page: currentPage,
        size: pageSize,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        keyword: "",
      };

      // Add keyword to payload if provided
      if (searchTerm) {
        payload.keyword = searchTerm;
      }

      const response = await axios.post(
        `${baseUrl}savings/admin/transactions/search/date-range`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this._token}`,
          },
        }
      );
      console.log(response);
      return response?.data;
    }

    // Search or default listing uses GET
    const api = searchTerm
      ? `${baseUrl}savings/admin/transactions/search?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`
      : `${baseUrl}savings/admin/transactions?page=${currentPage}&size=${pageSize}`;

    const response = await axios.get(api, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    console.log(response);
    return response?.data;
  }
  async updatePassword(payload: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await axios.post<{
      result: string;
      status: string;
      code: number;
      message: string;
    }>(`${baseUrl}api/user/admin/update-password`, payload, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);

    return response;
  }

  async autoSave(payload: { hourOfDay: number }) {
    const response = await axios.post<{
      result: string;
      status: string;
      code: number;
      message: string;
      data : string
    }>(`${baseUrl}api/admin/autosave/config`, payload, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);

    return response;
  }
}
