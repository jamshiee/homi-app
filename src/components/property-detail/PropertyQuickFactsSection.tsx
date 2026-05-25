import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { PropertyDto } from '@api/types';
import { Colors } from '@constants/colors';
import { PropertyTypeEnum } from '@/common/enums/property-enums/property-type.enum';

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
          value: 'Road Access'
        });
      }
    } else if (property.type === PropertyTypeEnum.HOUSE && property.houseDetail) {
      if (property.houseDetail.bedrooms) {
        facts.push({ icon: 'bed-outline', value: `${property.houseDetail.bedrooms} Beds` });
      }
      if (property.houseDetail.bathrooms) {
        facts.push({ icon: 'water-outline', value: `${property.houseDetail.bathrooms} Baths` });
      }
      if (property.houseDetail.floors) {
        facts.push({ icon: 'layers-outline', value: `${property.houseDetail.floors} Floors` });
      }
      if (property.houseDetail.balconies !== undefined) {
        facts.push({ icon: 'grid-outline', value: `${property.houseDetail.balconies} Balconies` });
      }
      if (property.houseDetail.furnishingStatus) {
        facts.push({ icon: 'color-palette-outline', value: property.houseDetail.furnishingStatus.replace(/_/g, ' ') });
      }
    } else if (property.type === PropertyTypeEnum.BUILDING && property.buildingDetail) {
      if (property.buildingDetail.totalArea) {
        facts.push({ icon: 'expand-outline', value: `${property.buildingDetail.totalArea} ${property.buildingDetail.areaUnit ?? 'Unit'}` });
      }
      if (property.buildingDetail.floorNumber !== undefined) {
        facts.push({ icon: 'layers-outline', value: `Floor ${property.buildingDetail.floorNumber}` });
      }
      if (property.buildingDetail.currentStatus) {
        facts.push({ icon: 'key-outline', value: property.buildingDetail.currentStatus });
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
        facts.push({ icon: 'restaurant-outline', value: 'Meals Included' });
      }
    }

    if (property.advanceAmount) {
      facts.push({
        icon: 'cash-outline',
        value: `Adv: ₹${property.advanceAmount}`,
      });
    }

    return facts;
  };

  const facts = getFacts();

  if (facts.length === 0) return null;

  return (
    <View className="py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {facts.map((fact, index) => (
          <View
            key={index}
            className="flex-row items-center rounded-xl border border-gray-200  bg-gray-50 px-3 py-2"
          >
            <Ionicons name={fact.icon as any} size={16} color={Colors.muted}  />
            <Text className="text-[13px] font-semibold text-black capitalize">{fact.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
