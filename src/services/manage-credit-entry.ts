import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";

export class CreditEntryService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  // async createAssets(payload: {
  //   name: string;
  //   category: string;
  //   subCategory: string;
  //   amount: number;
  //   maxTenor: number;
  //   availableUnits: number;
  //   description: string;
  //   categoryId: string;
  //   created_by: string;
  //   image : string;
  //   created_on: Date
  // }) {
  //   const response = await axios.post<{
  //     message: string;
  //     result: string;
  //     status: string;
  //     code: number;
  //   }>(`${baseUrl}asset/admin`, payload, {
  //     headers: {
  //       Authorization: `Bearer ${this._token}`,
  //     },
  //   });
  //   console.log(response);

  //   return response;
  // }
  async createBulkCreditEntry(data: FormData) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
      // data : any
    }>(`${baseUrl}asset/admin/bulk-upload`, data, {
      headers: {
        Authorization: `Bearer ${this._token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);

    return response;
  }
  // async getCreditEntries(pageSize: number , currentPage: number, search: string) {
  //      const api = search
  //         ? `${baseUrl}savings/admin/credit-entry/list/search/?keyword=${search}&page=${currentPage}&size=${pageSize}`
  //         : `${baseUrl}savings/admin/credit-entry/list?page=${currentPage}&size=${pageSize}`;

  //   const response = await axios.get( api , {
  //     headers: {
  //       Authorization: `Bearer ${this._token}`,
  //     },
  //   });
  //   console.log(response);
  //   return response?.data;
  // }

  async getCreditEntries(
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
    api = `${baseUrl}savings/admin/credit-entry/list/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&page=${currentPage}&size=${pageSize}`;
  } else if (searchTerm) {
    api = `${baseUrl}savings/admin/credit-entry/list/search/?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`;
  } else {
    api = `${baseUrl}savings/admin/credit-entry/list?page=${currentPage}&size=${pageSize}`;
  }

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
