import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { InviteResult, WaitlistApiResponse, WaitlistEntry, WaitlistList } from "@/types/waitlist-type";

/** The people who joined the web waitlist. */
export class WaitlistService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async getList(q: string, page: number, size: number) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (q.trim()) params.append("q", q.trim());
    const response = await axios.get<WaitlistApiResponse<WaitlistList>>(`${baseUrl}api/admin/waitlist?${params.toString()}`, {
      headers: this.headers,
    });
    return response?.data;
  }

  /** Lets this person into the web while the waitlist is on, and emails them their link. Super admins only. */
  async invite(id: string) {
    const response = await axios.post<WaitlistApiResponse<InviteResult>>(`${baseUrl}api/admin/waitlist/${encodeURIComponent(id)}/invite`, {}, { headers: this.headers });
    return response?.data;
  }

  /** Takes the invite back: off the tester list, and their link stops working. */
  async withdrawInvite(id: string) {
    const response = await axios.delete<WaitlistApiResponse<null>>(`${baseUrl}api/admin/waitlist/${encodeURIComponent(id)}/invite`, { headers: this.headers });
    return response?.data;
  }

  /** Everyone, newest first (the server stops at 50,000), for the CSV. */
  async exportAll() {
    const response = await axios.get<WaitlistApiResponse<WaitlistEntry[]>>(`${baseUrl}api/admin/waitlist/export`, { headers: this.headers });
    return response?.data;
  }
}
