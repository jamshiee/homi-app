import { TransactionTypeFilter } from '@/common/enums/transaction-type-filter.enum';
import { apiClient } from './client';
import { ApiResponse } from './types';
import { SortOptionEnum } from '@/common/enums/sort-option-filter.enum';

export interface PropertyFilter {
  type?: string;
  transactionType?: TransactionTypeFilter;
  district?: string;
  keyword?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishingStatus?: string;
  minArea?: number;
  maxArea?: number;
  areaUnit?: string;
  buildingSubtype?: string;
  roomType?: string;
  sort?: SortOptionEnum;
}

export const propertiesApi = {
  getFeed: (filters: PropertyFilter) =>
    apiClient.get<ApiResponse<unknown[]>>('/properties', { params: filters }),

  getFeatured: () =>
    apiClient.get<ApiResponse<unknown[]>>('/properties/featured'),

  getById: (id: string) =>
    apiClient.get<ApiResponse<unknown>>(`/properties/${id}`),

  logEnquiry: (
    propertyId: string,
    enquiryType: 'view' | 'whatsapp' | 'phone_reveal',
  ) => apiClient.post(`/properties/${propertyId}/enquiry`, { enquiryType }),

  toggleSave: (propertyId: string) =>
    apiClient.post<ApiResponse<{ saved: boolean }>>('/saved-properties/toggle', {
      propertyId,
    }),

  getSaved: () =>
    apiClient.get<ApiResponse<unknown[]>>('/saved-properties/me'),

  getDistricts: () =>
    apiClient.get<ApiResponse<string[]>>('/properties/locations/districts'),
};
