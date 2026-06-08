import { baseUrl } from "../constants";
import { LoginResponseType } from "../types";
// import { TempLoginData } from "@/types/temp-login-data";
import axios from "axios";

export class AuthService {
  // private _token: string | null = null;
  // constructor(token: string | null = null) {
  //   this._token = token;
  // }

  async login(payload: { username: string; password: string }) {
    const response = await axios.post<LoginResponseType>(
      `${baseUrl}api/user/auth/admin/login`,
      {
        ...payload,
      }
    );
    return response.data;
  }
  async changePassword(payload: { email: string }) {
    const response = await axios.post<LoginResponseType>(
      `${baseUrl}api/user/auth/admin/forgot-password`,
      {
        ...payload,
      }
    );
    return response.data;
  }

    async forgotPassword(payload: { newPassword: string; confirmPassword : string }) {
    const response = await axios.post<LoginResponseType>(
      `${baseUrl}api/user/auth/admin/reset-password`,
      {
        ...payload,
      }
    );
    return response.data;
  }

  // async verifyPassword(payload: {
  //   password: string;
  //   conPassword: string;
  //   username: string | null;
  //   phone: string;
  // }) {
  //   const response = await axios.post<VerifySuccessResponse>(
  //     `${baseUrl}/user/auth/confirm-password`,
  //     {
  //       ...payload,
  //     },
  //   );
  //   return response.data;
  // }

  // async resetPassword(payload: { username: string | null; phone: string }) {
  //   const response = await axios.post<VerifySuccessResponse>(
  //     `${baseUrl}/user/auth/forgot-password`,
  //     {
  //       ...payload,
  //     },
  //   );
  //   return response.data;
  // }

  // async verifyToken(payload: TempLoginData & { response: string }) {
  //   const response = await axios.post<{ token: string }>(
  //     `${baseUrl}/user/auth/securePass`,
  //     {
  //       ...payload,
  //     },
  //   );
  //   return response.data;
  // }

  async logoutUser(token: string) {
    await axios.get(`${baseUrl}/user/auth/logout`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // async changePassword(payload: {
  //   userId: string;
  //   oldPassword: string;
  //   newPassword: string;
  // }) {
  //   const response = await axios.post<ApiResponseType<string>>(
  //     `${baseUrl}/users/reset/password/id`,
  //     payload,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${this._token}`,
  //       },
  //     },
  //   );
  //   return response?.data;
  // }
}
