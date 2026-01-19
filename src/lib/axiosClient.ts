import axios from "axios";
import env from "./env";

const http = axios.create({
  baseURL: env.BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("JWT");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(config.baseURL);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default http;
