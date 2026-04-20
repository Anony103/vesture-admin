import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";

export class AuditLogService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  
 async getAuditLogs(
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
    api = `${baseUrl}api/user/audit-log/date-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&page=${currentPage}&size=${pageSize}`;
  } else if (searchTerm) {
    api = `${baseUrl}api/user/audit-log/search?keyword=${searchTerm}&page=${currentPage}&size=${pageSize}`;
  } else {
    api = `${baseUrl}api/user/audit-log?page=${currentPage}&size=${pageSize}`;
  }

  const response = await axios.get(api, {
    headers: {
      Authorization: `Bearer ${this._token}`,
    },
  });
  
  console.log(response);
  return response;
}


}
