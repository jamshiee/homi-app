import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { PropertyDto } from '@api/types';
import { Colors } from '@constants/colors';
import { formatPrice } from '@utils/price';
import { PropertyTypeEnum } from '@/common/enums/property-type.enum';

export interface PropertyCardProps {
  property: PropertyDto;
  onPress?: (id: string) => void;
  onSaveToggle?: (id: string) => void;
  isSaved?: boolean;
  onWhatsAppPress?: (property: PropertyDto) => void;
  onCallPress?: (property: PropertyDto) => void;
  onViewNumberPress?: (property: PropertyDto) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onSaveToggle,
  isSaved = false,
  onWhatsAppPress,
  onCallPress,
  onViewNumberPress,
}) => {
  const { t } = useTranslation();




  const coverImage = 
    property.propertyMedia?.find((m) => m.isCover)?.media?.url ??
    "cover"

  const ownerName =
    property.listedByUser?.name ?? property.lister?.name ?? 'Owner';

type PropertyPill = {
  iconName: keyof typeof Ionicons.glyphMap;
  value: string | number;
};

const pills = (): PropertyPill[] => {
  const pills: PropertyPill[] = [];

  switch (property.type) {
    case PropertyTypeEnum.LAND: {
      if (property.landDetail?.totalArea) {
        pills.push({
          iconName: 'resize',
          value: `${property.landDetail.totalArea} ${
            property.landDetail.areaUnit ?? 'Cents'
          }`,
        });
      }

      if(property.landDetail?.hasRoadAccess){
   pills.push({
        iconName: 'trail-sign',
        value: 'Road Access',
      });
      }
   

      return pills;
    }

    case PropertyTypeEnum.HOUSE: {
      if (property.houseDetail?.bedrooms) {
        pills.push({
          iconName: 'bed',
          value: `${property.houseDetail.bedrooms} Beds`,
        });
      }

      if (property.houseDetail?.bathrooms) {
        pills.push({
          iconName: 'water',
          value: `${property.houseDetail.bathrooms} Bathrooms`,
        });
      }

      if (property.houseDetail?.floors) {
        pills.push({
          iconName: 'business',
          value: `${property.houseDetail.floors} ${
  property.houseDetail.floors === 1
    ? 'Floor'
    : 'Floors'
}`,
        });
      }

      return pills;
    }

    case PropertyTypeEnum.BUILDING: {
      if (property.buildingDetail?.totalArea) {
        pills.push({
          iconName: 'resize',
          value: `${property.buildingDetail.totalArea} sqft`,
        });
      }

      if (property.buildingDetail?.floorNumber) {
        pills.push({
          iconName: 'layers',
value: `${property.buildingDetail.floorNumber} ${
  property.buildingDetail.floorNumber === 1
    ? 'Floor'
    : 'Floors'
}`,        });
      }

      if (property.buildingDetail?.currentStatus) {
        pills.push({
          iconName: 'home',
          value: property.buildingDetail.currentStatus,
        });
      }

      return pills;
    }

    case PropertyTypeEnum.HOTEL: {
      if (property.hotelDetail?.roomType) {
        pills.push({
          iconName: 'bed',
          value: property.hotelDetail.roomType,
        });
      }

      if (property.hotelDetail?.subType) {
        pills.push({
          iconName: 'business',
          value: property.hotelDetail.subType,
        });
      }

      if (property.hotelDetail?.pricePerNight) {
        pills.push({
          iconName: 'cash',
          value: `₹${property.hotelDetail.pricePerNight} /Night`,
        });
      }

      return pills;
    }

    default:
      return [];
  }
};

  return (
   <TouchableOpacity
  activeOpacity={0.9}
  onPress={() => onPress?.(property.id)}
  className="mx-3 my-1.5 overflow-hidden rounded-xl border border-gray-200 bg-white"
>
  {/* Image */}
  <View className="relative h-[220px]  p-2">
    {coverImage ? (
      <Image
        source={{ uri: coverImage }}
        className="h-full w-full rounded-xl"
        resizeMode="cover"
      />
    ) : (
      <View className="flex-1 items-center justify-center rounded-xl">
        <Ionicons
          name="camera-outline"
          size={32}
          color={Colors.lightMuted}
        />

        <Text className="mt-2 text-[13px] text-gray-400">
          {t('property.no_photos', 'No photos')}
        </Text>
      </View>
    )}

    {/* Owner pill */}
    <View className="absolute left-4 top-4 rounded-full bg-black/50 px-2 py-1">
      <Text className="text-[11px] font-medium text-white">
        {ownerName}
      </Text>
    </View>

    {/* Featured badge */}
    {/* {property.isFeatured && (
      <View className="absolute bottom-3 left-3 rounded-full bg-yellow-400 px-2 py-1">
        <Text className="text-[11px] font-bold text-black">
          {t('property.featured', 'Featured')}
        </Text>
      </View>
    )} */}
  </View>

  {/* Content */}
  <View className="p-4">
    <View className="flex-row items-start justify-between">
      <Text
        numberOfLines={1}
        className="flex-1  text-[22px] font-bold text-black"
      >
        {property.title ||
          `${property.type} for ${property.transactionType}`}
      </Text>

      <Text className="text-[22px] font-bold text-black">
        {formatPrice(property.price)}
      </Text>
    </View>

    {/* Location */}
    <View className="mb-5 mt-1 flex-row items-center">
      <Ionicons
        name="location-outline"
        size={14}
        color={Colors.muted}
      />

      <Text className="ml-1 text-xs text-gray-500">
        {property.locality}, {property.district}
      </Text>
    </View>

    {/* Pills */}
    <View className="mb-2 flex-row flex-wrap w-full gap-2 ">
      {pills().map((item, idx) => (
        <View
          key={idx}
          className="mb-2 flex-row items-center gap-1  rounded-md bg-gray-100 px-3 py-2"
        >
          <Ionicons
            name={item.iconName as any}
            size={14}
            color={Colors.muted}
          />

          <Text className=" capitalize text-xs text-gray-600">
            {item.value}
          </Text>
        </View>
      ))}
    </View>

    {/* Actions */}
    <View className="flex-row gap-2">
      <TouchableOpacity
        onPress={() => onPress?.(property.id)}
        className="h-10 flex-1 items-center justify-center rounded-full bg-black"
      >
        <Text className="text-[13px] font-bold text-white">
          {t('property.call', 'View Detail')}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</TouchableOpacity>
  );
};
