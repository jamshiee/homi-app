import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { AmenityDto } from '@api/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';


interface PropertyAmenitiesSectionProps {
  amenities?: Array<{ amenity: AmenityDto }>;
  lang: 'en' | 'ml';
}

export function PropertyAmenitiesSection({ amenities, lang }: PropertyAmenitiesSectionProps) {
  const { t } = useTranslation();

  if (!amenities || amenities.length === 0) return null;

  return (
    <View className="px-4 py-4">
      <Text className="mb-4 text-[18px] font-bold text-black">
        {t('property.amenities')}
      </Text>
      <View className="flex-row flex-wrap gap-x-[4%] gap-y-3">
        {amenities.map(({ amenity }) => (
          <View
            key={amenity.id}
            className="w-[30%] items-center justify-center rounded-2xl bg-gray-50 p-3 shadow-sm shadow-gray-300  "
          >
            <View className="mb-2 h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm shadow-gray-200 border border-yellow-300  ">
              <MaterialCommunityIcons name={(amenity.iconName as any) || 'checkmark-circle-outline'} size={20} color={Colors.dark} />
            </View>
            <Text className="text-center text-[12px] font-bold text-gray-700 leading-tight">
              {lang === 'ml' ? amenity.nameMl : amenity.nameEn}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
