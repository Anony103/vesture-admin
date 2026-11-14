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
    }>(`${baseUrl}api/admin/staff-data/upload`, data, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    console.log(response);

    return response;
  }
  // async getEmployeeInfos(pageSize: number , currentPage: number, search: string) {
  //      const api = search
  //         ? `${baseUrl}api/admin/staff-data/search/?keyword=${search}&page=${currentPage}&size=${pageSize}`
  //         : `${baseUrl}api/admin/staff-data/all?page=${currentPage}&size=${pageSize}`;

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
    api = `${baseUrl}api/admin/staff-data/search/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&page=${currentPage}&size=${pageSize}`;
  } else if (searchTerm) {
    api = `${baseUrl}api/admin/staff-data/search/?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`;
  } else {
    api = `${baseUrl}api/admin/staff-data/all?page=${currentPage}&size=${pageSize}`;
  }

  const response = await axios.get(api, {
    headers: {
      Authorization: `Bearer ${this._token}`,
    },
  });
  
  return response?.data;
}


  /**
   * Every staff record for an export: the whole date range when one is chosen, otherwise every page of the list (or of the search),
   * fetched a thousand at a time.
   */
  async getAllForExport(options?: { searchTerm?: string; dateRange?: { startDate: string; endDate: string } }) {
    const { searchTerm, dateRange } = options || {};
    const headers = { Authorization: `Bearer ${this._token}` };

    if (dateRange?.startDate && dateRange?.endDate) {
      const response = await axios.get(
        `${baseUrl}api/admin/staff-data/search/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers }
      );
      return (response?.data?.data ?? []) as Record<string, unknown>[];
    }

    const size = 1000;
    const rows: Record<string, unknown>[] = [];
    for (let page = 1; ; page++) {
      const api = searchTerm
        ? `${baseUrl}api/admin/staff-data/search/?keyword=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`
        : `${baseUrl}api/admin/staff-data/all?page=${page}&size=${size}`;
      const response = await axios.get(api, { headers });
      const body = response?.data?.data;
      rows.push(...(body?.content ?? []));
      if (page >= (body?.totalPages ?? 1)) break;
    }
    return rows;
  }
}
