import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";

export type Organisation = {
  id: string;
  name: string;
  /** starts every IPPIS number of this organisation, e.g. CD */
  prefix: string;
  /** no staff record: Vesture issues the customer's number at sign-up */
  openRegistration: boolean;
  /** hidden from sign-up when false */
  active: boolean;
  nextNumber: number;
};

export type OrganisationInput = Partial<Pick<Organisation, "name" | "prefix" | "openRegistration" | "active">>;

type Envelope<T> = { status: string; message: string; data: T };

/** The employers shown at public-sector sign-up, with the prefix their IPPIS numbers start with. */
export class OrganisationService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async getAll() {
    const response = await axios.get<Envelope<Organisation[]>>(`${baseUrl}api/admin/organisations`, { headers: this.headers });
    return response?.data;
  }

  async create(input: OrganisationInput) {
    const response = await axios.post<Envelope<Organisation>>(`${baseUrl}api/admin/organisations`, input, { headers: this.headers });
    return response?.data;
  }

  async update(id: string, input: OrganisationInput) {
    const response = await axios.put<Envelope<Organisation>>(`${baseUrl}api/admin/organisations/${id}`, input, { headers: this.headers });
    return response?.data;
  }
}
