import type { AdminLoginRequest, AdminLoginResponse } from "../types/login";
import API from "./axios";

export const adminLogInService = async (data: AdminLoginRequest) => {
  const response = await API.post<AdminLoginResponse>("/admin/login", data);
  localStorage.setItem("token", response.data.token);
};
