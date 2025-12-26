import axios from "axios";
import { enqueueSnackbar } from "notistack";

const API = axios.create({
  baseURL: import.meta.env.API_BASE_URL, // یا process.env.REACT_APP_API_URL
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
      enqueueSnackbar("خطای احراز هویت", { variant: "error" });
    }
    return Promise.reject(error);
  }
);

export default API;
