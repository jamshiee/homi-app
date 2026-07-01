import { TransactionTypeFilter } from "@/common/enums/transaction-type-filter.enum";
import { apiClient } from "./client";
import { ApiResponse, isSavedDto } from "./types";
import { SortOptionEnum } from "@/common/enums/sort-option-filter.enum";
import { PropertyType } from "@/store/filter.store";

export interface PropertyFilter {
  type?: PropertyType[] | undefined;
  transactionType?: TransactionTypeFilter;
  district?: string;
  locality?: string;
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
  hotelSubtype?: string;
  roomType?: string;
  hotelCategory?: string;
  sort?: SortOptionEnum;
}

export const propertiesApi = {
  getFeed: (filters: PropertyFilter) => {
    const params = { ...filters };
    if (params.type && Array.isArray(params.type)) {
      params.type = params.type.join(",") as any;
    }
    return apiClient.get<ApiResponse<unknown[]>>("/properties", { params });
  },

  getFeatured: (params?: { district?: string; locality?: string }) =>
    apiClient.get<ApiResponse<unknown[]>>("/properties/featured", { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<unknown>>(`/properties/${id}`),

  update: (id: string, payload: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<unknown>>(`/properties/${id}`, payload),

  getRelated: (id: string) =>
    apiClient.get<ApiResponse<unknown[]>>(`/properties/${id}/related`),

  logEnquiry: (
    propertyId: string,
    enquiryType: "view" | "whatsapp" | "phone_reveal",
  ) => apiClient.post(`/properties/${propertyId}/enquiry`, { enquiryType }),

  toggleSave: (propertyId: string) =>
    apiClient.post<ApiResponse<{ saved: boolean }>>(
      "/saved-properties/toggle",
      {
        propertyId,
      },
    ),

  isSaved: (propertyId: string) =>
    apiClient.get<ApiResponse<isSavedDto>>(
      `/saved-properties/${propertyId}/saved`,
    ),

  getSaved: () => apiClient.get<ApiResponse<unknown[]>>("/saved-properties/me"),

  getMine: (params?: Partial<PropertyFilter>) =>
    apiClient.get<ApiResponse<unknown[]>>("/properties/me", { params }),

  delete: (id: string) => apiClient.delete(`/properties/${id}`),

  getDistricts: () =>
    apiClient.get<ApiResponse<string[]>>("/properties/locations/districts"),

  getLocalities: (district?: string) =>
    apiClient.get<ApiResponse<string[]>>("/properties/locations/localities", {
      params: district ? { district } : {},
    }),
};
