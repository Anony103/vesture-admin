import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import {
  KycApiResponse,
  KycDetail,
  KycFilter,
  KycListResponse,
  KycStepName,
} from "@/types/kyc-type";

export class KycService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async getList(filter: KycFilter, q: string, page: number, size: number) {
    const params = new URLSearchParams({
      filter,
      page: String(page),
      size: String(size),
    });
    if (q.trim()) params.append("q", q.trim());
    const response = await axios.get<KycApiResponse<KycListResponse>>(
      `${baseUrl}api/kyc/admin?${params.toString()}`,
      { headers: this.headers }
    );
    return response?.data;
  }

  async getDetail(userId: string) {
    const response = await axios.get<KycApiResponse<KycDetail>>(
      `${baseUrl}api/kyc/admin/${userId}`,
      { headers: this.headers }
    );
    return response?.data;
  }

  /** Lets the customer try a step again; the failed attempts stay on record. */
  async resetAttempts(userId: string, step: KycStepName) {
    const response = await axios.post<KycApiResponse<number>>(
      `${baseUrl}api/kyc/admin/${userId}/reset?step=${step}`,
      {},
      { headers: this.headers }
    );
    return response?.data;
  }

  async retryBankOne(userId: string, tier: 2 | 3) {
    const response = await axios.post<KycApiResponse<unknown>>(
      `${baseUrl}api/kyc/admin/${userId}/bankone-retry?tier=${tier}`,
      {},
      { headers: this.headers }
    );
    return response?.data;
  }

  /** The picture needs the staff token, so it is fetched as a blob rather than used as an <img src>. */
  async getDocumentImage(documentId: string) {
    const response = await axios.get<Blob>(
      `${baseUrl}api/kyc/admin/documents/${documentId}/image`,
      { headers: this.headers, responseType: "blob" }
    );
    return response.data;
  }
}
