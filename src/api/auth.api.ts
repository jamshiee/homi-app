import { apiClient } from './client';
import { AuthUser, ApiResponse } from './types';

export interface SendOtpResponse {
  channel: 'whatsapp' | 'sms';
  expiresIn: number;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: AuthUser;
}

export const authApi = {
  sendOtp: (phone: string) =>
    apiClient.post<ApiResponse<SendOtpResponse>>('/auth/send-otp', { phone }),

  verifyOtp: (phone: string, otp: string, preferredLanguage?: 'en' | 'ml') =>
    apiClient.post<ApiResponse<VerifyOtpResponse>>('/auth/verify-otp', {
      phone,
      otp,
      preferredLanguage,
    }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken },
    ),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  getMe: () => apiClient.get<ApiResponse<AuthUser>>('/auth/me'),
};
