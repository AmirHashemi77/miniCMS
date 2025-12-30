import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { logOut } from "../lib/auth";

const API = axios.create({
  baseURL: "http://localhost:3001/api", // یا process.env.REACT_APP_API_URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl: string = error.config?.url ?? "";
      const isLoginRequest = requestUrl.includes("/admin/login");

      if (!isLoginRequest) {
        enqueueSnackbar("خطای احراز هویت", { variant: "error" });
        logOut();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
