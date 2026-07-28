import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/portal/auth.store';

const BASE_URL = typeof window !== 'undefined'
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:20000/api');

let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

function subscribeTokenRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10_000,
    withCredentials: true, // 🔒 Đính kèm HttpOnly cookies tự động trong mọi request
    headers: { 'Content-Type': 'application/json' },
  });

  // Interceptor response: nếu 401, tự động gọi refreshSession qua server endpoint
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError<{ message?: string }>) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        if (typeof window !== 'undefined') {
          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const success = await useAuthStore.getState().refreshToken();
              isRefreshing = false;
              if (success) {
                onRefreshed(true);
                return instance(originalRequest);
              }
            } catch (refreshError) {
              isRefreshing = false;
              return Promise.reject(refreshError);
            }
          } else {
            return new Promise((resolve, reject) => {
              subscribeTokenRefresh((success) => {
                if (success) {
                  resolve(instance(originalRequest));
                } else {
                  reject(error);
                }
              });
            });
          }
        }
      }

      const message =
        error.response?.data?.message ?? error.message ?? 'Something went wrong';
      return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
    },
  );

  return instance;
}

export const apiClient = createApiClient();
