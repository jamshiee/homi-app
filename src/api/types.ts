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
  url: string;
  isCover: boolean;
  order: number;
}

export interface PropertyDto {
  id: string;
  title: string;
  type: 'land' | 'house' | 'building' | 'hotel';
  transactionType: 'buy' | 'rent' | 'lease';
  district: string;
  locality: string;
  price: number;
  isFeatured: boolean;
  contactPhone: string;
  alternatePhone: string | null;
  publishedAt: string | null;
  description: string | null;
  listedByUser: {
    name: string | null;
    id: number;
  };
  propertyMedia: PropertyMediaDto[];
  savedBy: unknown[]; // used to check if saved
  
  // Specific details
  landDetail?: {
    totalArea: number;
    areaUnit: string;
    hasRoadAccess: boolean;
  };
  houseDetail?: {
    bedrooms: number;
    bathrooms: number;
    floors: number;
  };
  buildingDetail?: {
    totalArea: number;
    floorNumber: number;
    currentStatus: string;
  };
  hotelDetail?: {
    roomType: string;
    propertySubtype: string;
    pricePerNight: number;
  };
}
