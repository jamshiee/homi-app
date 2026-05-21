import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { useFilterStore, PropertyType } from '@store/filter.store';
import { useAuthStore } from '@store/auth.store';
import { useFeaturedProperties, usePropertyFeed } from '@hooks/useProperties';
import { useLocation } from '@hooks/useLocation';
import { PropertyCard } from '@components/PropertyCard';
import { PropertyDto } from '@api/types';
import { LocationBottomSheet } from '@components/LocationBottomSheet';
import { FilterBottomSheet } from '@components/FilterBottomSheet';
import { FilterButton } from '@components/FilterButton';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const filterType = useFilterStore((state) => state.type);
  const filterDistrict = useFilterStore((state) => state.district);
  const setFilter = useFilterStore((state) => state.setFilter);

  // Initialize location fetching
  useLocation();

  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Queries
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedProperties();
  const { data: feedData, isLoading: feedLoading } = usePropertyFeed({
    type: filterType !== 'all' ? filterType : undefined,
    district: filterDistrict,
  });

  const featuredProperties = (featuredData?.data?.data as PropertyDto[]) || [];
  
  // Extract flatten feed items
  const feedProperties =
    feedData?.pages.flatMap((page) => page.data.data as PropertyDto[]) || [];

  const handleQuickFilter = (type: PropertyType) => {
    setFilter({ type });
  };

  const navToSearch = () => {
    router.push({ pathname: '/(tabs)/search', params: { focus: 'true' } });
  };

  const navToProperty = (id: string) => {
    router.push(`/property/${id}`);
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
      <View style={{ flex: 1 }}>
        {/* Header Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
          {/* Logo Placeholder */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="diamond" size={24} color={Colors.yellow} />
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginLeft: 4, letterSpacing: 1 }}>HOMI</Text>
          </View>

          {/* Location Pill */}
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

          {/* Notifications & Avatar */}
          {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color={Colors.dark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: Colors.dark }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Search & Filter Row */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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

          <FilterButton
            onPress={() => setFilterSheetVisible(true)}
            size={48}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Quick Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 16 }}
          >
            {types.map((mod) => {
              const isActive = filterType === mod.value;
              return (
                <TouchableOpacity
                  key={mod.value}
                  onPress={() => handleQuickFilter(mod.value)}
                  style={{
                    backgroundColor: isActive ? Colors.yellow : Colors.white,
                    borderWidth: isActive ? 1.5 : 1,
                    borderColor: isActive ? Colors.dark : Colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? Colors.dark : Colors.muted,
                      fontWeight: isActive ? 'bold' : '500',
                      fontSize: 13,
                    }}
                  >
                    {mod.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Featured Properties Section */}
          {!featuredLoading && featuredProperties.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
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
                contentContainerStyle={{ paddingHorizontal: 4 }}
                snapToInterval={292} // 280 width + 12 margin
                decelerationRate="fast"
              >
                {featuredProperties.map((prop) => (
                  <View key={prop.id} style={{ width: 280 }}>
                    <PropertyCard property={prop} onPress={navToProperty} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Latest Properties Feed */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.dark }}>
                {filterDistrict ? t('home.latest_near_you', 'Latest Near You') : t('home.latest_properties', 'Latest Properties')}
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
              <View style={{ paddingHorizontal: 4 }}>
                {feedProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} onPress={navToProperty} />
                ))}
              </View>
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
      </View>
      <LocationBottomSheet visible={locationSheetVisible} onClose={() => setLocationSheetVisible(false)} />
      <FilterBottomSheet visible={filterSheetVisible} onClose={() => setFilterSheetVisible(false)} />
    </SafeAreaView>
  );
}
