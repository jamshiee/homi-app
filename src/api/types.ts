import { PropertyTypeEnum } from "@/common/enums/property-type.enum";
import { TransactionTypeFilter } from "@/common/enums/transaction-type-filter.enum";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  preferredLanguage: 'en' | 'ml';
  profileMediaId: string | null;
  isAdmin: boolean;
}

export interface PropertyMediaDto {
  id: string;
  propertyId: string
  mediaId: string;
  media: MediaDto;
  isCover: boolean;
  sortOrder: number;
}

export interface MediaDto {
  id: string;
  url: string
  mimeType:string
  originalFileName:string
}

export interface AmenityDto {
  id: string;
  nameEn: string;
  nameMl: string;
  iconName: string;
}

export interface PropertyDto {
  id: string;
  title: string;
  type: PropertyTypeEnum;
  transactionType: TransactionTypeFilter;
  district: string;
  locality: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price: number;
  isNegotiable?: boolean;
  advanceAmount?: number | null;
  priceUnit?: string | null;
  isFeatured: boolean;
  status?: string;
  moderationStatus?: string;
  contactPhone: string;
  alternatePhone: string | null;
  publishedAt: string | null;
  description: string | null;
  viewCount?: number;
  whatsappTapCount?: number;
  phoneRevealCount?: number;
  isSaved?: boolean;
  listedByUser?: {
    id: string;
    name: string | null;
  };
  lister?: {
    id: string;
    name: string | null;
  };
  propertyMedia: PropertyMediaDto[];
  propertyAmenities?: Array<{ amenity: AmenityDto }>;

  // Type-specific details
  landDetail?: {
    totalArea: string | number;
    areaUnit: string;
    hasRoadAccess?: boolean;
  };
  houseDetail?: {
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    floors: number;
    hasKitchen: boolean;
    furnishingStatus: string;
    houseType?: string;
  };
  buildingDetail?: {
    subType: string;
    totalArea: string | number;
    areaUnit: string;
    floorNumber: number;
    currentStatus: string;
  };
  hotelDetail?: {
    subType: string;
    roomsAvailable: number;
    roomType: string;
    occupancy: string;
    mealsIncluded: boolean;
    pricePerNight?: string | number | null;
    pricePerMonth?: string | number | null;
  };
}

export interface isSavedDto {
  saved : boolean
}
