import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PropertyDescriptionSectionProps {
  description?: string | null;
}

export function PropertyDescriptionSection({ description }: PropertyDescriptionSectionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  const isLong = description.length > 250;
  const displayDesc = expanded ? description : (isLong ? `${description.slice(0, 250)}...` : description);

  return (
    <View className="px-4 py-4">
      <Text className="mb-3 text-[18px] font-bold text-black">
        {t('property.description')}
      </Text>
      <Text className="text-[15px] leading-relaxed text-gray-700">
        {displayDesc}
      </Text>
      {isLong && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} className="mt-2">
          <Text className="text-[15px] font-bold text-black underline">
            {expanded ? t('common.read_less') : t('common.read_more')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
