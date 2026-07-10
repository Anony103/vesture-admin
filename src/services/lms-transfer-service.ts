import { baseUrl } from "@/constants";

import axios from "axios";
import { GeneralAdminService } from "./general-admin-service";
import {
  LmsPaymentProvider,
  LmsTransferConfig,
  LmsTransferConfigHistory,
  LmsTransferInstruction,
  LmsTransferReport,
} from "@/types/table-type";

type LmsApiResponse<T> = {
  code: number;
  status: string;
  message: string;
  data: T;
};

export class LmsTransferService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  async getAllTransfers(status?: string, transferStatus?: string) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (transferStatus) params.append("transferStatus", transferStatus);
    const query = params.toString();

    const response = await axios.get<LmsApiResponse<LmsTransferInstruction[]>>(
      `${baseUrl}api/admin/lms-transfer${query ? `?${query}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response?.data;
  }

  async retryTransfer(id: string) {
    const response = await axios.post<LmsApiResponse<string>>(
      `${baseUrl}api/admin/lms-transfer/${id}/retry`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response?.data;
  }

  async resendWebhook(id: string) {
    const response = await axios.post<LmsApiResponse<string>>(
      `${baseUrl}api/admin/lms-transfer/${id}/resend-webhook`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response?.data;
  }

  // Bank lists used to resolve providusBankCode / bankoneBankCode to bank names.
  // Each provider returns its own item shape, so items are kept loosely typed.
  async getProvidusBanks() {
    const response = await axios.get<
      LmsApiResponse<Record<string, unknown>[]>
    >(`${baseUrl}api/providus/get-banks`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    return response?.data;
  }

  async getBankOneBanks() {
    const response = await axios.get<
      LmsApiResponse<Record<string, unknown>[]>
    >(`${baseUrl}api/bankone/commercial-banks`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    return response?.data;
  }

  async triggerReprocess() {
    const response = await axios.post<
      LmsApiResponse<{ processed: number; successful: number; failed: number }>
    >(
      `${baseUrl}api/admin/lms-transfer/trigger`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response?.data;
  }

  async getReport(filters: {
    provider?: string;
    period?: string;
    from?: string;
    to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters.provider) params.append("provider", filters.provider);
    if (filters.period) params.append("period", filters.period);
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    const query = params.toString();

    const response = await axios.get<LmsApiResponse<LmsTransferReport>>(
      `${baseUrl}api/admin/lms-transfer/report${query ? `?${query}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response?.data;
  }

  async getConfig() {
    const response = await axios.get<LmsApiResponse<LmsTransferConfig[]>>(
      `${baseUrl}api/admin/lms-transfer/config`,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response?.data;
  }

  async updateConfig(payload: {
    provider: LmsPaymentProvider;
    sourceAccount: string;
  }) {
    const response = await axios.post<LmsApiResponse<LmsTransferConfig>>(
      `${baseUrl}api/admin/lms-transfer/config`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response?.data;
  }

  async activateProvider(provider: LmsPaymentProvider) {
    const response = await axios.post<LmsApiResponse<LmsTransferConfig>>(
      `${baseUrl}api/admin/lms-transfer/config/activate`,
      { provider },
      {
        headers: {
          Authorization: `Bearer ${this._token}`,
        },
      }
    );
    return response?.data;
  }

  async getConfigHistory() {
    const response = await axios.get<
      LmsApiResponse<LmsTransferConfigHistory[]>
    >(`${baseUrl}api/admin/lms-transfer/config/history`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    });
    return response?.data;
  }
}
