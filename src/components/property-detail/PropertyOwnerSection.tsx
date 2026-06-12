import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PropertyOwnerSectionProps {
  ownerName: string;
  ownerImage: string | null;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PropertyOwnerSection({ ownerName,ownerImage, isOwner, onEdit ,onDelete }: PropertyOwnerSectionProps) {
  const { t } = useTranslation();

  return (
    <View className="px-4 py-6">
      <View className="flex-row items-center rounded-2xl bg-gray-50 p-4 border border-gray-100">
  <View className="mr-4">
  {ownerImage ? (
    <Image
      source={{ uri: ownerImage }}
      className="h-14 w-14 rounded-full border border-gray-200"
      resizeMode="cover"
    />
  ) : (
    <View className="h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
      <Text className="text-[20px] font-bold text-black">
        {ownerName[0]?.toUpperCase()}
      </Text>
    </View>
  )}
</View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-black">{ownerName}</Text>
          <View className="mt-1 self-start rounded-md bg-white px-2 py-1 shadow-sm shadow-gray-200 border border-gray-100">
            <Text className="text-[10px] font-bold text-gray-500 tracking-wider">{t('property.lister_badge')}</Text>
          </View>
        </View>
        <View className='flex-row gap-1'>
        {isOwner && (
          <TouchableOpacity
            onPress={onEdit}
            className="rounded-full border-2 border-black px-4 py-2"
          >
            <Text className="text-[13px] font-bold text-black">
              {t('property.edit')}
            </Text>
          </TouchableOpacity>
        )}
        {isOwner && (
          <TouchableOpacity
            onPress={onDelete}
            className="rounded-full border-2 border-red-600 px-4 py-2 bg-red-500"
          >
            <Text className="text-[13px] font-bold text-white ">
              {t('property.delete')}
            </Text>
          </TouchableOpacity>
        )}
        </View>
      </View>
    </View>
  );
}
