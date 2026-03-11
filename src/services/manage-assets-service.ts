import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";

export class ManageAssetService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  async createAssets(payload: {
    name: string;
    category: string | undefined;
    amount: number;
    maxTenor: number | undefined;
    availableUnits: number;
    description: string;
    categoryId: string | undefined;
    created_by: string | null | undefined;
    created_on: Date;
  }) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
    }>(`${baseUrl}asset/admin`, payload, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);

    return response;
  }

  async updateAsset(payload: {
    id: number | undefined;
    name: string;
    category: string | undefined;
    amount: number;
    maxTenor: number | undefined;
    availableUnits: number;
    description: string;
    categoryId: string | undefined;
    created_by: string | null | undefined;
    image?: string | undefined;
    created_on: Date;
  }) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
    }>(`${baseUrl}asset/admin/update`, payload, {
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
    }>(`${baseUrl}asset/admin/bulk-upload`, data, {
      headers: {
        Authorization: `Bearer ${this._token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);

    return response;
  }
  // async getAllAssets(pageSize: number , currentPage: number, searchTerm: string) {

  //    const api = searchTerm
  //     ? `${baseUrl}asset/admin/all/search?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`
  //     : `${baseUrl}asset/admin/all?page=${currentPage}&size=${pageSize}`;

  //   const response = await axios.get( api , {
  //     headers: {
  //       Authorization: `Bearer ${this._token}`,
  //     },
  //   });
  //   // console.log(response);
  //   return response?.data;
  // }

  async getAllAssets(options?: {
    pageSize?: number;
    currentPage?: number;
    searchTerm?: string;
    dateRange?: { startDate: string; endDate: string };
  }) {
    const { pageSize, currentPage, searchTerm, dateRange } = options || {};

    let api: string;

    // Priority: date range > search term > default listing
    if (dateRange?.startDate && dateRange?.endDate) {
      api = `${baseUrl}asset/admin/search/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&page=${currentPage}&size=${pageSize}`;
    } else if (searchTerm) {
      api = `${baseUrl}asset/admin/all/search?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`;
    } else {
      api = `${baseUrl}asset/admin/all?page=${currentPage}&size=${pageSize}`;
    }

    const response = await axios.get(api, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    // console.log(response);
    return response?.data;
  }

  async getAssetDetails(id: string | undefined) {
    const response = await axios.get(`${baseUrl}asset/admin/${id}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);
    return response?.data;
  }
  async deleteAsset(id: string | undefined) {
    const response = await axios.get<{
      message: string;
      result: string;
      status: string;
      code: number;
    }>(`${baseUrl}asset/admin/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    console.log(response);
    return response;
  }
}
