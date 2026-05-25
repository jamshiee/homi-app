import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { formatPrice } from '@utils/price';

interface PropertyIdentitySectionProps {
  transactionType: string;
  isFeatured: boolean;
  title?: string;
  price: string;
  locality?: string;
  district?: string;
}

export function PropertyIdentitySection({
  transactionType,
  isFeatured,
  title,
  price,
  locality,
  district,
}: PropertyIdentitySectionProps) {
  const { t } = useTranslation();

  return (
    <View className="px-4 py-5">
      <View className="mb-2 flex-row items-center gap-2">
        <View className="rounded-lg bg-gray-100 px-2 py-1">
          <Text className="text-[11px] font-bold uppercase text-gray-500">
            {t(`transaction.${transactionType}`, transactionType)}
          </Text>
        </View>
        {isFeatured && (
          <View className="rounded-lg bg-yellow-400 px-2 py-1">
            <Text className="text-[11px] font-bold text-black">
              {t('property.featured', 'Featured')}
            </Text>
          </View>
        )}
      </View>

      <Text className="mb-2 text-[22px] font-bold text-black leading-tight">
        {title}
      </Text>

      <View className="mb-3 flex-row items-baseline gap-1">
        <Text className="text-[26px] font-bold text-black">
          {formatPrice(price)}
        </Text>
        {transactionType === 'rent' && (
          <Text className="text-[14px] text-gray-500">/ month</Text>
        )}
      </View>

      <View className="flex-row items-center gap-1">
        <Ionicons name="location-outline" size={16} color={Colors.muted} />
        <Text className="text-[14px] text-gray-500">
          {locality}, {district}
        </Text>
      </View>
    </View>
  );
}
