import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PropertyDto } from '@api/types';
import { PropertyCard } from '@components/PropertyCard';

interface RelatedPropertiesSectionProps {
  properties: PropertyDto[];
  onPress: (id: string) => void;
  onWhatsAppPress: (property: PropertyDto) => void;
  onCallPress: (property: PropertyDto) => void;
}

export function RelatedPropertiesSection({
  properties,
  onPress,
  onWhatsAppPress,
  onCallPress,
}: RelatedPropertiesSectionProps) {
  const { t } = useTranslation();

  if (!properties || properties.length === 0) return null;

  return (
    <View className="py-6">
      <View className="mb-4 px-4 flex-row items-center justify-between">
        <Text className="text-[18px] font-bold text-black">
          {t('property.related_properties', 'Related Properties')}
        </Text>
      </View>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
          gap: 16,
        }}
        renderItem={({ item: prop }) => (
          <View style={{ width: 320 }}>
            <PropertyCard
              property={prop}
              onPress={onPress}
              onWhatsAppPress={onWhatsAppPress}
              onCallPress={onCallPress}
            />
          </View>
        )}
      />
    </View>
  );
}
