import axios from "axios";
import { baseUrl } from "@/constants";
import { GeneralAdminService } from "./general-admin-service";
import { WebhookApiResponse } from "@/types/webhook-type";
import { ProductAvailability } from "@/types/product-availability-type";

/** Super admins open BuyNow PayLater for new purchases, or put it back to "coming soon". */
export class ProductAvailabilityService extends GeneralAdminService {
  constructor(token: string) {
    super(token);
    this._token = token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this._token}` };
  }

  async get() {
    const response = await axios.get<WebhookApiResponse<ProductAvailability>>(`${baseUrl}api/admin/product-availability`, { headers: this.headers });
    return response?.data;
  }

  async save(payload: ProductAvailability) {
    const response = await axios.put<WebhookApiResponse<ProductAvailability>>(`${baseUrl}api/admin/product-availability`, payload, { headers: this.headers });
    return response?.data;
  }
}
