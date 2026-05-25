import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { useFilterStore, PropertyType } from '@store/filter.store';
import { useFeaturedProperties, usePropertyFeed } from '@hooks/useProperties';
import { useLocation } from '@hooks/useLocation';
import { PropertyCard } from '@components/PropertyCard';
import { FeaturedPropertyCard } from '@components/FeaturedPropertyCard';
import { LocationBottomSheet } from '@components/LocationBottomSheet';
import { FilterBottomSheet } from '@components/FilterBottomSheet';
import { FilterButton } from '@components/FilterButton';
import { PropertyDto } from '@api/types';
import { openWhatsApp, openPhone } from '@utils/contact';
import { propertiesApi } from '@api/properties.api';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const filterType = useFilterStore((s) => s.type);
  const filterDistrict = useFilterStore((s) => s.district);
  const setFilter = useFilterStore((s) => s.setFilter);

  useLocation();

  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedProperties();
  const { data: feedData, isLoading: feedLoading } = usePropertyFeed({
    type: filterType !== 'all' ? filterType : undefined,
    district: filterDistrict,
  });

  const featuredProperties = (featuredData?.data?.data as PropertyDto[]) ?? [];
  const feedProperties =
    feedData?.pages.flatMap((p) => p.data.data as PropertyDto[]) ?? [];

  const navToProperty = (id: string) => router.push(`/property/${id}`);
  const navToSearch = () =>
    router.push({ pathname: '/(tabs)/search', params: { focus: 'true' } });

  const handleWhatsApp = async (property: PropertyDto) => {
    await propertiesApi.logEnquiry(property.id, 'whatsapp').catch(() => null);
    openWhatsApp(property.contactPhone, property.title ?? property.type);
  };

  const handleCall = async (property: PropertyDto) => {
    await propertiesApi.logEnquiry(property.id, 'phone_reveal').catch(() => null);
    openPhone(property.contactPhone);
  };

  const handleViewNumber = (property: PropertyDto) => {
    router.push(`/property/${property.id}`);
  };

  const types: { label: string; value: PropertyType }[] = [
    { label: t('modules.all', 'All'), value: 'all' },
    { label: t('modules.land', 'Land/Plot'), value: 'land' },
    { label: t('modules.house', 'House'), value: 'house' },
    { label: t('modules.building', 'Building'), value: 'building' },
    { label: t('modules.hotel', 'Hotel/PG'), value: 'hotel' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="diamond" size={24} color={Colors.yellow} />
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginLeft: 4, letterSpacing: 1 }}>
            HOMI
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setLocationSheetVisible(true)}
          style={{
            backgroundColor: Colors.yellow,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 13, marginRight: 4 }}>
            {filterDistrict || t('location.all', 'All Locations')}
          </Text>
          <Ionicons name="chevron-down" size={14} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Search + filter row */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={navToSearch}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: Colors.border,
            height: 48,
            borderRadius: 24,
            paddingHorizontal: 16,
          }}
        >
          <Ionicons name="search" size={20} color={Colors.muted} style={{ marginRight: 8 }} />
          <Text style={{ color: Colors.muted, fontSize: 15 }}>
            {t('search.placeholder', 'Search locality, area...')}
          </Text>
        </TouchableOpacity>
        <FilterButton onPress={() => setFilterSheetVisible(true)} size={48} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Quick filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 16 }}
        >
          {types.map((mod) => {
            const active = filterType === mod.value;
            return (
              <TouchableOpacity
                key={mod.value}
                onPress={() => setFilter({ type: mod.value })}
                style={{
                  backgroundColor: active ? Colors.yellow : Colors.white,
                  borderWidth: active ? 1.5 : 1,
                  borderColor: active ? Colors.dark : Colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: active ? Colors.dark : Colors.muted,
                    fontWeight: active ? 'bold' : '500',
                    fontSize: 13,
                  }}
                >
                  {mod.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured section */}
        {!featuredLoading && featuredProperties.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.dark }}>
                {t('home.featured', 'Featured')}
              </Text>
              <TouchableOpacity onPress={navToSearch}>
                <Text style={{ fontSize: 13, color: Colors.muted, fontWeight: '600' }}>
                  {t('home.see_all', 'See all →')}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
              snapToInterval={306} // 290 width + 16 margin
              decelerationRate="fast"
            >
              {featuredProperties.map((prop) => (
                <FeaturedPropertyCard
                  key={prop.id}
                  property={prop}
                  onPress={navToProperty}
                  onWhatsAppPress={handleWhatsApp}
                  onCallPress={handleCall}
                  onViewNumberPress={handleViewNumber}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Latest feed */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.dark }}>
              {filterDistrict
                ? t('home.latest_near_you', 'Latest Near You')
                : t('home.latest_properties', 'Latest Properties')}
            </Text>
            <TouchableOpacity onPress={navToSearch}>
              <Text style={{ fontSize: 13, color: Colors.muted, fontWeight: '600' }}>
                {t('home.see_all', 'See all →')}
              </Text>
            </TouchableOpacity>
          </View>

          {feedLoading ? (
            <ActivityIndicator size="large" color={Colors.yellow} style={{ marginTop: 24 }} />
          ) : feedProperties.length > 0 ? (
            feedProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onPress={navToProperty}
                onWhatsAppPress={handleWhatsApp}
                onCallPress={handleCall}
                onViewNumberPress={handleViewNumber}
              />
            ))
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40 }}>
              <Ionicons name="search-outline" size={48} color={Colors.lightMuted} />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.dark, marginTop: 12 }}>
                {t('home.empty_feed', 'No properties found')}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 4 }}>
                {t('home.empty_feed_sub', 'Try selecting a different filter.')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <LocationBottomSheet
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
      />
      <FilterBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
      />
    </SafeAreaView>
  );
}
