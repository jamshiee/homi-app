import { create } from "zustand";
import { localStorage } from "../utils/storage";
import { BuildingSubTypeEnum } from "@/common/enums/property-enums/building-subtype.enum";
import { AreaUnitEnum } from "@/common/enums/property-enums/area-unit.enum";
import { BuildingStatusEnum } from "@/common/enums/property-enums/building-status.enum";
import { HotelSubTypeEnum } from "@/common/enums/property-enums/hotel-subtype.enum";
import { RoomTypeEnum } from "@/common/enums/property-enums/room-type.enum";
import { FurnishingStatusEnum } from "@/common/enums/property-enums/furnishing-status.enum";
import { PriceUnitEnum } from "@/common/enums/property-enums/price-unit.enum";
import { PropertyTypeEnum } from "@/common/enums/property-enums/property-type.enum";
import { TransactionTypeFilter } from "@/common/enums/transaction-type-filter.enum";

export interface PostPhoto {
  uri: string;
  isCover: boolean;
  file?: any;
  propertyMediaId?: string;
}

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
  isVerified: boolean;
  advanceAmount?: number;
  priceUnit: PriceUnitEnum;
  description: string;
  contactPhone: string;
  alternatePhone?: string;
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
  amenityIds: string[];
  photos: PostPhoto[];
  scrollEnabled?: boolean;
  isEditMode: boolean;
  editingPropertyId?: string;
  isDirty: boolean;
  editSnapshot?: Record<string, unknown>;
}

const defaultPostState: PostState = {
  step: 1,
  type: PropertyTypeEnum.HOUSE,
  scrollEnabled: true,
  title: "",
  transactionType: TransactionTypeFilter.RENT,
  district: "",
  locality: "",
  address: "",
  latitude: "",
  longitude: "",
  price: 0,
  isNegotiable: false,
  isVerified: false,
  advanceAmount: undefined,
  priceUnit: PriceUnitEnum.TOTAL,
  description: "",
  contactPhone: "",
  alternatePhone: "",
  landDetail: undefined,
  houseDetail: undefined,
  buildingDetail: undefined,
  hotelDetail: undefined,
  amenityIds: [],
  photos: [],
  isEditMode: false,
  editingPropertyId: undefined,
  isDirty: false,
  editSnapshot: undefined,
};

const DRAFT_STORAGE_KEY = "homi_post_listing_draft";

const serializeDraft = (state: PostState) => ({
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
  isVerified: state.isVerified,
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
  photos: state.photos.map((p) => ({
    uri: p.uri,
    isCover: p.isCover,
    propertyMediaId: p.propertyMediaId,
  })),
});

interface PostStore extends PostState {
  setField: (updates: Partial<PostState>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => Promise<void>;
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<void>;
  hydrateForEdit: (property: any) => void;
}

export const usePostStore = create<PostStore>((set, get) => ({
  ...defaultPostState,

  setField: (updates) => {
    set((state) => {
      const nextState = { ...state, ...updates };
      const isDirty = state.isEditMode
        ? JSON.stringify(serializeDraft(nextState)) !==
          JSON.stringify(state.editSnapshot)
        : false;

      if (!nextState.isEditMode) {
        void localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify(serializeDraft(nextState)),
        );
      }

      return { ...nextState, isDirty };
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
    if (!state.isEditMode) {
      await localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify(serializeDraft(state)),
      );
    }
  },

  loadDraft: async () => {
    try {
      const draftStr = await localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        set({
          ...defaultPostState,
          ...draft,
          isEditMode: false,
          editingPropertyId: undefined,
          isDirty: false,
        });
      }
    } catch (err) {
      console.warn("Failed to load listing draft", err);
    }
  },

  hydrateForEdit: (property) => {
    const photos = (property?.propertyMedia ?? [])
      .slice()
      .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item: any) => ({
        uri: item?.media?.url ?? item?.url,
        isCover: Boolean(item?.isCover),
        propertyMediaId: item?.id,
      }));

    const nextState = {
      ...defaultPostState,
      step: 1,
      type: property?.type ?? PropertyTypeEnum.HOUSE,
      title: property?.title ?? "",
      transactionType: property?.transactionType ?? TransactionTypeFilter.RENT,
      district: property?.district ?? "",
      locality: property?.locality ?? "",
      address: property?.address ?? "",
      latitude: property?.latitude?.toString() ?? "",
      longitude: property?.longitude?.toString() ?? "",
      price: Number(property?.price) || 0,
      isNegotiable: Boolean(property?.isNegotiable),
      isVerified: Boolean(property?.isVerified),
      advanceAmount: property?.advanceAmount ?? undefined,
      priceUnit: property?.priceUnit ?? PriceUnitEnum.TOTAL,
      description: property?.description ?? "",
      contactPhone: property?.contactPhone ?? "",
      alternatePhone: property?.alternatePhone ?? "",
      landDetail: property?.landDetail
        ? {
            totalArea: Number(property.landDetail.totalArea) || 0,
            areaUnit: property.landDetail.areaUnit ?? AreaUnitEnum.SQFT,
          }
        : undefined,
      houseDetail: property?.houseDetail
        ? {
            bedrooms: Number(property.houseDetail.bedrooms) || 0,
            bathrooms: Number(property.houseDetail.bathrooms) || 0,
            balconies: Number(property.houseDetail.balconies) || 0,
            floors: Number(property.houseDetail.floors) || 0,
            hasKitchen: Boolean(property.houseDetail.hasKitchen),
            furnishingStatus:
              property.houseDetail.furnishingStatus ??
              FurnishingStatusEnum.UN_FURNISHED,
          }
        : undefined,
      buildingDetail: property?.buildingDetail
        ? {
            subType:
              property.buildingDetail.subType ?? BuildingSubTypeEnum.OFFICE,
            totalArea: Number(property.buildingDetail.totalArea) || 0,
            areaUnit: property.buildingDetail.areaUnit ?? AreaUnitEnum.SQFT,
            floorNumber: Number(property.buildingDetail.floorNumber) || 0,
            currentStatus:
              property.buildingDetail.currentStatus ??
              BuildingStatusEnum.READY_TO_MOVE,
          }
        : undefined,
      hotelDetail: property?.hotelDetail
        ? {
            subType: property.hotelDetail.subType ?? HotelSubTypeEnum.HOTEL,
            roomType: property.hotelDetail.roomType ?? RoomTypeEnum.SINGLE,
            occupancy: Number(property.hotelDetail.occupancy) || 1,
            mealsIncluded: Boolean(property.hotelDetail.mealsIncluded),
          }
        : undefined,
      amenityIds: (property?.propertyAmenities ?? [])
        .map((item: any) => item.amenity?.id ?? item.amenityId)
        .filter(Boolean),
      photos,
      scrollEnabled: true,
      isEditMode: true,
      editingPropertyId: property?.id,
      isDirty: false,
      editSnapshot: serializeDraft({
        ...defaultPostState,
        step: 1,
        type: property?.type ?? PropertyTypeEnum.HOUSE,
        title: property?.title ?? "",
        transactionType:
          property?.transactionType ?? TransactionTypeFilter.RENT,
        district: property?.district ?? "",
        locality: property?.locality ?? "",
        address: property?.address ?? "",
        latitude: property?.latitude?.toString() ?? "",
        longitude: property?.longitude?.toString() ?? "",
        price: Number(property?.price) || 0,
        isNegotiable: Boolean(property?.isNegotiable),
        isVerified: Boolean(property?.isVerified),
        advanceAmount: property?.advanceAmount ?? undefined,
        priceUnit: property?.priceUnit ?? PriceUnitEnum.TOTAL,
        description: property?.description ?? "",
        contactPhone: property?.contactPhone ?? "",
        alternatePhone: property?.alternatePhone ?? "",
        landDetail: property?.landDetail
          ? {
              totalArea: Number(property.landDetail.totalArea) || 0,
              areaUnit: property.landDetail.areaUnit ?? AreaUnitEnum.SQFT,
            }
          : undefined,
        houseDetail: property?.houseDetail
          ? {
              bedrooms: Number(property.houseDetail.bedrooms) || 0,
              bathrooms: Number(property.houseDetail.bathrooms) || 0,
              balconies: Number(property.houseDetail.balconies) || 0,
              floors: Number(property.houseDetail.floors) || 0,
              hasKitchen: Boolean(property.houseDetail.hasKitchen),
              furnishingStatus:
                property.houseDetail.furnishingStatus ??
                FurnishingStatusEnum.UN_FURNISHED,
            }
          : undefined,
        buildingDetail: property?.buildingDetail
          ? {
              subType:
                property.buildingDetail.subType ?? BuildingSubTypeEnum.OFFICE,
              totalArea: Number(property.buildingDetail.totalArea) || 0,
              areaUnit: property.buildingDetail.areaUnit ?? AreaUnitEnum.SQFT,
              floorNumber: Number(property.buildingDetail.floorNumber) || 0,
              currentStatus:
                property.buildingDetail.currentStatus ??
                BuildingStatusEnum.READY_TO_MOVE,
            }
          : undefined,
        hotelDetail: property?.hotelDetail
          ? {
              subType: property.hotelDetail.subType ?? HotelSubTypeEnum.HOTEL,
              roomType: property.hotelDetail.roomType ?? RoomTypeEnum.SINGLE,
              occupancy: Number(property.hotelDetail.occupancy) || 1,
              mealsIncluded: Boolean(property.hotelDetail.mealsIncluded),
            }
          : undefined,
        amenityIds: (property?.propertyAmenities ?? [])
          .map((item: any) => item.amenity?.id ?? item.amenityId)
          .filter(Boolean),
        photos,
      }),
    };

    set(nextState);
  },
}));
