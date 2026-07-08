import { apiClient } from "./client";
import { ApiResponse, PropertyDto } from "./types";
import { PropertyFilter } from "./properties.api";

export interface FeatureConfigDto {
  isFeatured: boolean;
  featuredOrder?: number;
  featuredUntil?: string; // ISO date string
}

export interface ModerationActionDto {
  status: "approved" | "rejected";
  rejectionReason?: string;
}

export const adminPropertiesApi = {
  getAdminFeatured: () =>
    apiClient.get<ApiResponse<PropertyDto[]>>("/properties/admin/featured"),

  getAdminAll: (filters: PropertyFilter) =>
    apiClient.get<ApiResponse<PropertyDto[]>>("/properties/admin/all", {
      params: filters,
    }),

  setFeatured: (id: string, payload: FeatureConfigDto) =>
    apiClient.patch<ApiResponse<PropertyDto>>(
      `/properties/${id}/feature`,
      payload,
    ),

  reorderFeatured: (id: string, direction: "up" | "down") =>
    apiClient.patch<ApiResponse<PropertyDto>>(`/properties/${id}/reorder`, {
      direction,
    }),

  moderateProperty: (id: string, payload: ModerationActionDto) =>
    apiClient.patch<ApiResponse<PropertyDto>>(
      `/properties/${id}/moderate`,
      payload,
    ),
};
