import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PropertyOwnerSectionProps {
  ownerName: string;
  isOwner: boolean;
  onEdit?: () => void;
}

export function PropertyOwnerSection({ ownerName, isOwner, onEdit }: PropertyOwnerSectionProps) {
  const { t } = useTranslation();

  return (
    <View className="px-4 py-6">
      <View className="flex-row items-center rounded-2xl bg-gray-50 p-4 border border-gray-100">
        <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-gray-200">
          <Text className="text-[20px] font-bold text-black">{ownerName[0]?.toUpperCase()}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-black">{ownerName}</Text>
          <View className="mt-1 self-start rounded-md bg-white px-2 py-1 shadow-sm shadow-gray-200 border border-gray-100">
            <Text className="text-[10px] font-bold text-gray-500 tracking-wider">LISTER</Text>
          </View>
        </View>
        {isOwner && (
          <TouchableOpacity
            onPress={onEdit}
            className="rounded-full border-2 border-black px-4 py-2"
          >
            <Text className="text-[13px] font-bold text-black">
              {t('property.edit', 'Edit')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
