import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { PropertyDto } from '@api/types';
import { Colors } from '@constants/colors';
import { PropertyTypeEnum } from '@/common/enums/property-enums/property-type.enum';
import { formatPrice } from '@/utils/price';
import { FurnishingStatusEnum } from '@/common/enums/property-enums/furnishing-status.enum';

interface PropertyQuickFactsSectionProps {
  property: PropertyDto;
}

export function PropertyQuickFactsSection({ property }: PropertyQuickFactsSectionProps) {
  const { t } = useTranslation();

  const getFacts = () => {
    const facts: Array<{ icon: string; value: string }> = [];

    if (property.type === PropertyTypeEnum.LAND && property.landDetail) {
      facts.push({
        icon: 'expand-outline',
        value: `${property.landDetail.totalArea} ${property.landDetail.areaUnit ?? 'Unit'}`,
      });

      if (property.landDetail.hasRoadAccess) {
        facts.push({
          icon: 'car-outline',
          value: t('property.road_access'),
        });
      }
    } else if (property.type === PropertyTypeEnum.HOUSE && property.houseDetail) {
      if (property.houseDetail.bedrooms) {
        facts.push({ icon: 'bed-outline', value: `${property.houseDetail.bedrooms} ${t('property.beds')}` });
      }
      if (property.houseDetail.bathrooms) {
        facts.push({ icon: 'water-outline', value: `${property.houseDetail.bathrooms} ${t('property.baths')}` });
      }
      if (property.houseDetail.floors) {
        facts.push({ icon: 'layers-outline', value: `${property.houseDetail.floors} ${t('property.floors')}` });
      }
      if (property.houseDetail.balconies !== undefined) {
        facts.push({ icon: 'grid-outline', value: `${property.houseDetail.balconies} ${t('property.balconies')}` });
      }
      if (property.houseDetail.furnishingStatus) {
        facts.push({
          icon: 'color-palette-outline',
          value: property.houseDetail.furnishingStatus === FurnishingStatusEnum.FULLY_FURNISHED
            ? t('property.furnished')
            : property.houseDetail.furnishingStatus === FurnishingStatusEnum.SEMI_FURNISHED
            ? t('property.semi_furnished')
            : property.houseDetail.furnishingStatus === FurnishingStatusEnum.UN_FURNISHED
            ? t('property.not_furnished')
            : '',
        });
      }
    } else if (property.type === PropertyTypeEnum.BUILDING && property.buildingDetail) {
      if (property.buildingDetail.totalArea) {
        facts.push({ icon: 'expand-outline', value: `${property.buildingDetail.totalArea} ${property.buildingDetail.areaUnit ?? 'Unit'}` });
      }
      if (property.buildingDetail.floorNumber !== undefined) {
        facts.push({ icon: 'layers-outline', value: `${t('property.floor')}: ${property.buildingDetail.floorNumber}` });
      }
      if (property.buildingDetail.currentStatus) {
        facts.push({ icon: 'key-outline', value: property.buildingDetail.currentStatus.replaceAll('_', ' ') });
      }
    } else if (property.type === PropertyTypeEnum.HOTEL && property.hotelDetail) {
      if (property.hotelDetail.subType) {
        facts.push({ icon: 'business-outline', value: property.hotelDetail.subType });
      }
      if (property.hotelDetail.roomType) {
        facts.push({ icon: 'bed-outline', value: property.hotelDetail.roomType });
      }
      if (property.hotelDetail.occupancy) {
        facts.push({ icon: 'people-outline', value: property.hotelDetail.occupancy });
      }
      if (property.hotelDetail.mealsIncluded) {
        facts.push({ icon: 'restaurant-outline', value: t('property.meals_included') });
      }
    }

    if (property.advanceAmount) {
      facts.push({
        icon: 'cash-outline',
        value: `${t('property.advance_deposit_short')}: ${formatPrice(String(property.advanceAmount))}`,
      });
    }

    return facts;
  };

  const facts = getFacts();

  if (facts.length === 0) return null;

  return (
<View className="px-4 py-5">
  <Text className="mb-4 text-[18px] font-bold text-black">
    {t('property.highlights')}
  </Text>

  <View className="flex-row flex-wrap justify-between gap-y-3">
    {facts.map((fact) => (
      <View
        key={fact.value}
        className="w-[48%] flex-row items-center rounded-xl bg-gray-50 p-3"
      >
        <Ionicons
          name={fact.icon as any}
          size={18}
          color={Colors.dark}
        />

        <Text className="ml-2 flex-1 text-[14px] font-semibold text-black capitalize">
          {fact.value}
        </Text>
      </View>
    ))}
  </View>
</View>
  );
}
