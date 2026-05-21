import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { secureStorage } from '@utils/storage';
import { Config } from '@constants/config';

export const SECURE_KEYS = {
  ACCESS_TOKEN: 'homi_access_token',
  REFRESH_TOKEN: 'homi_refresh_token',
} as const;

const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Dedicated upload instance — long timeout for multipart file transfers over tunnels */
const uploadClient: AxiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 120_000, // 2 minutes — handles slow tunnel connections
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> =
  [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    console.log({"Axios Response Error: ": error });

    // Handle Network Errors or Timeouts
    if (!error.response) {
      console.log({"Error Response: ": error });
      const isNetworkError = error.message === 'Network Error';
      const errorMessage = isNetworkError
        ? 'Network Error: Cannot reach the server. Please check your connection or API URL.'
        : error.message;

      // Transform error for consistent UI handling
      const enhancedError = Object.assign(error, {
        response: {
          data: { message: errorMessage },
        },
      });
      return Promise.reject(enhancedError);
    }

    if (error.response?.status !== 401 || original._retry)
      return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) =>
        queue.push({ resolve, reject }),
      ).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await secureStorage.getItem(
        SECURE_KEYS.REFRESH_TOKEN,
      );
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${Config.API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });
      const { accessToken, refreshToken: newRefresh } = data.data;

      await secureStorage.setItem(SECURE_KEYS.ACCESS_TOKEN, accessToken);
      await secureStorage.setItem(SECURE_KEYS.REFRESH_TOKEN, newRefresh);

      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      await secureStorage.deleteItem(SECURE_KEYS.ACCESS_TOKEN);
      await secureStorage.deleteItem(SECURE_KEYS.REFRESH_TOKEN);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// Share the same auth token injector with uploadClient
uploadClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { apiClient, uploadClient };
