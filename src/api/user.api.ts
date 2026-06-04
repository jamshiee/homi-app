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

export const userApi = {
  updateProfile: (name?: string, preferredLanguage?: 'en' | 'ml') => apiClient.patch("/users/me", {
    name: name?.trim(),
    preferredLanguage: preferredLanguage,
  }),

};
