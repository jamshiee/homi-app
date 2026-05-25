import React from 'react';
import { View, Text, Platform, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';

interface PropertyLocationSectionProps {
  latitude?: number | null;
  longitude?: number | null;
  locality?: string;
  district?: string;
}

export function PropertyLocationSection({
  latitude,
  longitude,
  locality,
  district,
}: PropertyLocationSectionProps) {
  const { t } = useTranslation();

  const handleOpenMaps = () => {
    if (!latitude || !longitude) return;
    const label = `${locality}, ${district}`;
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${encodeURIComponent(label)}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(label)})`,
      default: `https://maps.google.com/?q=${latitude},${longitude}`
    });

    Linking.openURL(url);
  };

  return (
    <View className="px-4 py-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-[18px] font-bold text-black">
          {t('property.location', 'Location')}
        </Text>
        {latitude && longitude && (
          <TouchableOpacity onPress={handleOpenMaps}>
            <Text className="text-[14px] font-bold text-black underline">
              {t('property.open_in_maps', 'Open in Maps')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text className="mb-3 text-[14px] text-gray-600">
        <Ionicons name="location" size={14} color={Colors.dark} /> {locality}, {district}
      </Text>

      {latitude && longitude ? (
        <View className="overflow-hidden rounded-2xl border border-gray-200">
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={{ width: '100%', height: 200 }}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            pitchEnabled={false}
            rotateEnabled={false}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            <Marker coordinate={{ latitude, longitude }}>
              <View className="items-center justify-center rounded-full bg-red-100 p-2">
                <View className="h-4 w-4 rounded-full bg-red-500 border-2 border-white shadow-sm" />
              </View>
            </Marker>
          </MapView>
        </View>
      ) : (
        <View className="h-[160px] items-center justify-center rounded-2xl bg-gray-100">
          <Ionicons name="map-outline" size={40} color={Colors.lightMuted} />
          <Text className="mt-2 text-[14px] text-gray-500">
            {t('property.exact_location_hidden', 'Exact location not provided')}
          </Text>
        </View>
      )}
    </View>
  );
}
