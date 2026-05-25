import { create } from 'zustand';
import { localStorage } from '../utils/storage';
import { BuildingSubTypeEnum } from '@/common/enums/property-enums/building-subtype.enum';
import { AreaUnitEnum } from '@/common/enums/property-enums/area-unit.enum';
import { BuildingStatusEnum } from '@/common/enums/property-enums/building-status.enum';
import { HotelSubTypeEnum } from '@/common/enums/property-enums/hotel-subtype.enum';
import { RoomTypeEnum } from '@/common/enums/property-enums/room-type.enum';
import { FurnishingStatusEnum } from '@/common/enums/property-enums/furnishing-status.enum';
import { PriceUnitEnum } from '@/common/enums/property-enums/price-unit.enum';
import { PropertyTypeEnum } from '@/common/enums/property-enums/property-type.enum';
import { TransactionTypeFilter } from '@/common/enums/transaction-type-filter.enum';


export interface PostState {
  step: number;
  type: PropertyTypeEnum;
  title: string;
  transactionType: TransactionTypeFilter;
  district: string;
  locality: string;
  address: string;
  latitude: string;
  longitude: string;
  price: number;
  isNegotiable: boolean;
  advanceAmount?: number;
  priceUnit: PriceUnitEnum;
  description: string;
  contactPhone: string;
  alternatePhone?: string;

  // Sub-details
  landDetail?: {
    totalArea: number;
    areaUnit: AreaUnitEnum;
  };
  houseDetail?: {
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    floors: number;
    hasKitchen: boolean;
    furnishingStatus: FurnishingStatusEnum;
  };
  buildingDetail?: {
    subType: BuildingSubTypeEnum;
    totalArea: number;
    areaUnit: AreaUnitEnum;
    floorNumber: number;
    currentStatus: BuildingStatusEnum;
  };
  hotelDetail?: {
    subType: HotelSubTypeEnum;
    roomType: RoomTypeEnum;
    occupancy: number;
    mealsIncluded: boolean;
  };

  // Amenities and Photos
  amenityIds: string[];
  photos: { uri: string; isCover: boolean; file?: any }[];
  scrollEnabled?: boolean;
}

const defaultPostState: PostState = {
  step: 1,
  type: PropertyTypeEnum.HOUSE,
  scrollEnabled: true,
  title: '',
  transactionType: TransactionTypeFilter.RENT,
  district: '',
  locality: '',
  address: '',
  latitude: '',
  longitude: '',
  price: 0,
  isNegotiable: false,
  advanceAmount: undefined,
  priceUnit: PriceUnitEnum.TOTAL,
  description: '',
  contactPhone: '',
  alternatePhone: '',
  landDetail: undefined,
  houseDetail: undefined,
  buildingDetail: undefined,
  hotelDetail: undefined,
  amenityIds: [],
  photos: [],
};

const DRAFT_STORAGE_KEY = 'homi_post_listing_draft';

interface PostStore extends PostState {
  setField: (updates: Partial<PostState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => Promise<void>;
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<void>;
}

export const usePostStore = create<PostStore>((set, get) => ({
  ...defaultPostState,

  setField: (updates) => {
    set((state) => {
      const nextState = { ...state, ...updates };
      // Auto-save draft on every modification
      void localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        step: nextState.step,
        type: nextState.type,
        title: nextState.title,
        transactionType: nextState.transactionType,
        district: nextState.district,
        locality: nextState.locality,
        address: nextState.address,
        latitude: nextState.latitude,
        longitude: nextState.longitude,
        price: nextState.price,
        isNegotiable: nextState.isNegotiable,
        advanceAmount: nextState.advanceAmount,
        priceUnit: nextState.priceUnit,
        description: nextState.description,
        contactPhone: nextState.contactPhone,
        alternatePhone: nextState.alternatePhone,
        landDetail: nextState.landDetail,
        houseDetail: nextState.houseDetail,
        buildingDetail: nextState.buildingDetail,
        hotelDetail: nextState.hotelDetail,
        amenityIds: nextState.amenityIds,
        photos: nextState.photos.map(p => ({ uri: p.uri, isCover: p.isCover })),
      }));
      return nextState;
    });
  },

  nextStep: () => {
    const nextStep = Math.min(get().step + 1, 7);
    get().setField({ step: nextStep });
  },

  prevStep: () => {
    const prevStep = Math.max(get().step - 1, 1);
    get().setField({ step: prevStep });
  },

  resetForm: async () => {
    await localStorage.removeItem(DRAFT_STORAGE_KEY);
    set(defaultPostState);
  },

  saveDraft: async () => {
    const state = get();
    await localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      step: state.step,
      type: state.type,
      title: state.title,
      transactionType: state.transactionType,
      district: state.district,
      locality: state.locality,
      address: state.address,
      latitude: state.latitude,
      longitude: state.longitude,
      price: state.price,
      isNegotiable: state.isNegotiable,
      advanceAmount: state.advanceAmount,
      priceUnit: state.priceUnit,
      description: state.description,
      contactPhone: state.contactPhone,
      alternatePhone: state.alternatePhone,
      landDetail: state.landDetail,
      houseDetail: state.houseDetail,
      buildingDetail: state.buildingDetail,
      hotelDetail: state.hotelDetail,
      amenityIds: state.amenityIds,
      photos: state.photos.map(p => ({ uri: p.uri, isCover: p.isCover })),
    }));
  },

  loadDraft: async () => {
    try {
      const draftStr = await localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        set({ ...draft });
      }
    } catch (err) {
      console.warn('Failed to load listing draft', err);
    }
  },
}));
