import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";

export class ManageAssetCategoryService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  async createAssetCategory(payload: {
    id?: string;
    name?: string;
    created_by?: string;
    created_on?: Date;
  }) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
    }>(`${baseUrl}api/asset/admin/asset-category`, payload, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);

    return response;
  }
  async createSubCategory(payload: {
    id?: string;
    name?: string;
    created_by?: string;
    created_on?: Date;
  }) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
    }>(`${baseUrl}api/asset/admin/asset-sub-category`, payload, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);

    return response;
  }
  async deleteAssetCategory(id: string | undefined) {
    const response = await axios.get<{
      message: string;
      result: string;
      status: string;
      code: number;
    }>(`${baseUrl}api/asset/admin/asset-category/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    console.log(response);
    return response;
  }

  // async getAllAssetsCategories(
  //   pageSize: number,
  //   currentPage: number,
  //   search?: string
  // ) {
  //   const api = search
  //     ? `${baseUrl}asset/admin/asset-category/all/search?keyword=${search}&page=${currentPage}&size=${pageSize}`
  //     : `${baseUrl}asset/admin/asset-category/all?page=${currentPage}&size=${pageSize}`;

  //   const response = await axios.get( api, {
  //     headers: {
  //       Authorization: `Bearer ${this._token}`,
  //     },
  //   });
  //   console.log(response);
  //   return response?.data;
  // }

  async getAllAssetsCategories(options?: {
    pageSize?: number;
    currentPage?: number;
    searchTerm?: string;
    dateRange?: { startDate: string; endDate: string };
  }) {
    const { pageSize, currentPage, searchTerm, dateRange } = options || {};

    let api: string;

    // Priority: date range > search term > default listing
    if (dateRange?.startDate && dateRange?.endDate) {
      api = `${baseUrl}api/asset/admin/asset-category/search/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&page=${currentPage}&size=${pageSize}`;
    } else if (searchTerm) {
      api = `${baseUrl}api/asset/admin/asset-category/all/search?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`;
    } else {
      api = `${baseUrl}api/asset/admin/asset-category/all?page=${currentPage}&size=${pageSize}`;
    }

    const response = await axios.get(api, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });

    console.log(response);
    return response?.data;
  }
  async getCategoriesDetails(id: string | undefined) {
    const response = await axios.get(
      `${baseUrl}api/asset/admin/asset-category/${id}`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    console.log(response);
    return response?.data;
  }
}
