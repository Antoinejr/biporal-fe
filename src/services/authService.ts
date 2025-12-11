import type { Admin, SignInCredentialsType } from "@/lib/authType";
import http from "@/lib/axiosClient";
import { AxiosError } from "axios";

export const signIn = async (
  credentials: SignInCredentialsType,
): Promise<Admin> => {
  try {
    const url = "/api/auth/admin";
    const response = await http.post<Admin>(url, credentials);
    return response.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error("API Sign-In failed", err.response?.data || err.message);
    } else {
      console.error("Unexpected Sign-In Error", err);
    }
    throw err;
  }
};
