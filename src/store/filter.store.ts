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
  hotelSubtype?: string;
  roomType?: string;
  occupancy?: string;
  mealsIncluded?: boolean;
  hotelCategory?: string;
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

  hotelSubtype: undefined,
  roomType: undefined,
  occupancy: undefined,
  mealsIncluded: undefined,
  hotelCategory: undefined,
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
      // If module changes, clear type-specific filters
      if (updates.type && updates.type !== state.type) {
        const newType = updates.type;
        const newState = {
          ...state,
          ...updates,
        };

        // Clear hotel-specific filters when switching away from hotel
        if (state.type === 'hotel' && newType !== 'hotel') {
          newState.hotelSubtype = undefined;
          newState.roomType = undefined;
          newState.occupancy = undefined;
          newState.mealsIncluded = undefined;
          newState.hotelCategory = undefined;
        }

        // Clear house-specific filters when switching away from house
        if (state.type === 'house' && newType !== 'house') {
          newState.bedrooms = undefined;
          newState.bathrooms = undefined;
          newState.furnishingStatus = undefined;
        }

        // Clear building-specific filters when switching away from building
        if (state.type === 'building' && newType !== 'building') {
          newState.buildingSubtype = undefined;
          newState.floorNumber = undefined;
        }

        // Clear land-specific filters when switching away from land
        if (state.type === 'land' && newType !== 'land') {
          newState.minArea = undefined;
          newState.maxArea = undefined;
          newState.areaUnit = undefined;
        }

        return newState;
      }

      // If hotelSubtype changes to pg or lodge, clear hotelCategory (only hotel and resort have categories)
      if (updates.hotelSubtype && updates.hotelSubtype !== state.hotelSubtype) {
        const newSubtype = updates.hotelSubtype;
        if (newSubtype === 'pg' || newSubtype === 'lodge') {
          return {
            ...state,
            ...updates,
            hotelCategory: undefined,
          };
        }
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
      hotelSubtype: undefined,
      roomType: undefined,
      occupancy: undefined,
      mealsIncluded: undefined,
      hotelCategory: undefined,
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
