import { apiClient } from './client';
import { ApiResponse } from './types';

export interface ChatResponse {
  response: string;
}

export const aiApi = {
  chat: (message: string) =>
    apiClient.post<ApiResponse<ChatResponse>>('/ai/chat', { message }),
};
