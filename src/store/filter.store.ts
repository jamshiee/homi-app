import { FurnishingStatusEnum } from '@/common/enums/property-enums/furnishing-status.enum';
import { SortOptionEnum } from '@/common/enums/sort-option-filter.enum';
import { TransactionTypeFilter as TransactionType } from '@/common/enums/transaction-type-filter.enum';
import { create } from 'zustand';

export type PropertyType = 'land' | 'house' | 'building' | 'hotel' | 'all';

export interface FilterState {
  type: PropertyType;
  transactionType: TransactionType;
  district?: string;
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities: string[];
  sort: SortOptionEnum;
  nearbyOnly: boolean;

  // Dynamic Filters - Land
  minArea?: number;
  maxArea?: number;
  areaUnit?: string;

  // Dynamic Filters - House
  bedrooms?: number;
  bathrooms?: number;
  furnishingStatus?: FurnishingStatusEnum;

  // Dynamic Filters - Building
  buildingSubtype?: string;
  floorNumber?: number;

  // Dynamic Filters - Hotel
  roomType?: string;
  occupancy?: string;
  mealsIncluded?: boolean;
}

const defaultState: FilterState = {
  type: 'all',
  transactionType: TransactionType.ALL,
  district: undefined,
  locality: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  amenities: [],
  sort: SortOptionEnum.Newest,
  nearbyOnly: false,

  minArea: undefined,
  maxArea: undefined,
  areaUnit: 'cents',

  bedrooms: undefined,
  bathrooms: undefined,
  furnishingStatus: undefined,

  buildingSubtype: undefined,
  floorNumber: undefined,

  roomType: undefined,
  occupancy: undefined,
  mealsIncluded: undefined,
};

interface FilterStore extends FilterState {
  setFilter: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  clearDynamicFilters: () => void;
  toggleAmenity: (amenity: string) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaultState,

  setFilter: (updates) =>
    set((state) => {
      // If module changes, clear dynamic filters that don't apply
      if (updates.type && updates.type !== state.type) {
        return {
          ...state,
          ...updates,
          minArea: undefined,
          maxArea: undefined,
          bedrooms: undefined,
          bathrooms: undefined,
          furnishingStatus: undefined,
          buildingSubtype: undefined,
          floorNumber: undefined,
          roomType: undefined,
          occupancy: undefined,
          mealsIncluded: undefined,
        };
      }
      return { ...state, ...updates };
    }),

  resetFilters: () => set(defaultState),

  clearDynamicFilters: () =>
    set({
      minArea: undefined,
      maxArea: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      furnishingStatus: undefined,
      buildingSubtype: undefined,
      floorNumber: undefined,
      roomType: undefined,
      occupancy: undefined,
      mealsIncluded: undefined,
    }),

  toggleAmenity: (amenity) =>
    set((state) => {
      const exists = state.amenities.includes(amenity);
      if (exists) {
        return { amenities: state.amenities.filter((a) => a !== amenity) };
      }
      return { amenities: [...state.amenities, amenity] };
    }),
}));
