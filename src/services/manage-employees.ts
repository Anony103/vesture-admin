import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";

export class EmployeeInfosService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  
  async createEmloyeeInfos(data: FormData) {
    const response = await axios.post<{
      message: string;
      result: string;
      status: string;
      code: number;
      // data : any
    }>(`${baseUrl}admin/staff-data/upload`, data, {
      headers: {
        Authorization: `Bearer ${this._token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response);

    return response;
  }
  // async getEmployeeInfos(pageSize: number , currentPage: number, search: string) {
  //      const api = search
  //         ? `${baseUrl}admin/staff-data/search/?keyword=${search}&page=${currentPage}&size=${pageSize}`
  //         : `${baseUrl}admin/staff-data/all?page=${currentPage}&size=${pageSize}`;

  //   const response = await axios.get( api , {
  //     headers: {
  //       Authorization: `Bearer ${this._token}`,
  //     },
  //   });
  //   return response?.data;
  // }

  async getEmployeeInfos(
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
    api = `${baseUrl}admin/staff-data/search/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&page=${currentPage}&size=${pageSize}`;
  } else if (searchTerm) {
    api = `${baseUrl}admin/staff-data/search/?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`;
  } else {
    api = `${baseUrl}admin/staff-data/all?page=${currentPage}&size=${pageSize}`;
  }

  const response = await axios.get(api, {
    headers: {
      Authorization: `Bearer ${this._token}`,
    },
  });
  
  return response?.data;
}

}
