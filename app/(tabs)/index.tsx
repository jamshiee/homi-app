import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  LayoutAnimation,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { useFilterStore, PropertyType } from "@store/filter.store";
import { useFeaturedProperties, usePropertyFeed } from "@hooks/useProperties";
import { useLocation } from "@hooks/useLocation";
import { PropertyCard } from "@components/PropertyCard";
import { FeaturedPropertyCard } from "@components/FeaturedPropertyCard";
import { LocationBottomSheet } from "@components/LocationBottomSheet";
import { FilterBottomSheet } from "@components/FilterBottomSheet";
import { FilterButton } from "@components/FilterButton";
import { PropertyDto } from "@api/types";
import { useActiveFilters } from "@/hooks/useActiveFilters";
import { useAuthStore } from "@/store/auth.store";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  // const insets = useSafeAreaInsets();
  // // Tab bar height: 64px base + bottom safe area inset
  // const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 84 : 64;
  const fabBottom = 14;

  const filterType = useFilterStore((s) => s.type);
  const filterDistrict = useFilterStore((s) => s.district);
  const filterLocality = useFilterStore((s) => s.locality);
  const filterTransactionType = useFilterStore((s) => s.transactionType);
  const filterSort = useFilterStore((s) => s.sort);
  const filterMinPrice = useFilterStore((s) => s.minPrice);
  const filterMaxPrice = useFilterStore((s) => s.maxPrice);
  const filterBedrooms = useFilterStore((s) => s.bedrooms);
  const filterBathrooms = useFilterStore((s) => s.bathrooms);
  const filterFurnishingStatus = useFilterStore((s) => s.furnishingStatus);
  const filterMinArea = useFilterStore((s) => s.minArea);
  const filterMaxArea = useFilterStore((s) => s.maxArea);
  const filterAreaUnit = useFilterStore((s) => s.areaUnit);
  const filterBuildingSubtype = useFilterStore((s) => s.buildingSubtype);
  const filterHotelSubtype = useFilterStore((s) => s.hotelSubtype);
  const filterRoomType = useFilterStore((s) => s.roomType);
  const filterHotelCategory = useFilterStore((s) => s.hotelCategory);

  const { user } = useAuthStore();

  const activeFilters = useActiveFilters();
  const { resetFilters, setFilter } = useFilterStore();

  useLocation();

  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const {
    data: featuredData,
    isLoading: featuredLoading,
    refetch: refetchFeatured,
    isRefetching: isRefetchingFeatured,
  } = useFeaturedProperties(
    filterLocality
      ? { locality: filterLocality, district: filterDistrict }          // locality selected → pass both to enable fallback
      : filterDistrict
        ? { district: filterDistrict }        // district only → scope to district
        : undefined                           // nothing selected → global featured list
  );
  const {
    data: feedData,
    isLoading: feedLoading,
    refetch: refetchFeed,
    isRefetching: isRefetchingFeed,
  } = usePropertyFeed({
    type: filterType !== "all" ? filterType : undefined,
    district: filterDistrict,
    locality: filterLocality,
    transactionType: filterTransactionType,
    sort: filterSort,
    minPrice: filterMinPrice,
    maxPrice: filterMaxPrice,
    bedrooms: filterBedrooms,
    bathrooms: filterBathrooms,
    furnishingStatus: filterFurnishingStatus,
    minArea: filterMinArea,
    maxArea: filterMaxArea,
    areaUnit: filterAreaUnit,
    buildingSubtype: filterBuildingSubtype,
    hotelSubtype: filterHotelSubtype,
    roomType: filterRoomType,
    hotelCategory: filterHotelCategory,
  });

  const onRefresh = async () => {
    await Promise.all([refetchFeatured(), refetchFeed()]);
  };

  const isRefreshing = isRefetchingFeatured || isRefetchingFeed;

  const featuredProperties = (featuredData?.data?.data as PropertyDto[]) ?? [];
  const feedProperties =
    feedData?.pages.flatMap((p) => p.data.data as PropertyDto[]) ?? [];

  const navToProperty = (id: string) => router.push(`/property/${id}`);
  const navToSearch = () =>
    router.push({ pathname: "/(tabs)/search", params: { focus: "true" } });

  const types: { label: string; value: PropertyType }[] = [
    { label: t("modules.all", "All"), value: "all" },
    { label: t("modules.hotel", "Hotel,Resort & Lodge"), value: "hotel" },
    { label: t("modules.land", "Land/Plot"), value: "land" },
    { label: t("modules.house", "House"), value: "house" },
    { label: t("modules.building", "Building"), value: "building" },
  ];
  const featuredTypes: PropertyType[] = ["hotel"];

  const renderEmptyState = () => (
    <View>
      {activeFilters.length > 0 ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            marginTop: 40,
          }}
        >
          <Ionicons name="search-outline" size={64} color={Colors.lightMuted} />

          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.dark,
              marginTop: 16,
            }}
          >
            {t("search.no_results", "No results in {{area}}", {
              area: filterLocality || filterDistrict || "this area",
            })}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: Colors.muted,
              marginTop: 8,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {t(
              "search.try_nearby",
              "Try searching a nearby locality or clearing your filters",
            )}
          </Text>

          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              resetFilters();
            }}
            style={{
              backgroundColor: Colors.yellow,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: Colors.dark,
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {t("search.reset_filters", "Reset All Filters")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            marginTop: 40,
          }}
        >
          <Ionicons name="home-outline" size={64} color={Colors.lightMuted} />

          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.dark,
              marginTop: 16,
            }}
          >
            {t("search.no_properties", "No properties found")}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: Colors.muted,
              marginTop: 8,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {user?.isAdmin
              ? t(
                  "home.create_first_property",
                  "There are no properties yet. Create the first listing.",
                )
              : t(
                  "home.no_properties_available",
                  "There are no properties available at the moment. Please check back later.",
                )}
          </Text>

          {user?.isAdmin && (
            <TouchableOpacity
              onPress={() => router.push("/post" as any)}
              style={{
                backgroundColor: Colors.yellow,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: Colors.dark,
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                {t("property.create", "Create Property")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/logo-transparent.png")} // adjust path
            style={{
              width: 32,
              height: 32,
              resizeMode: "contain",
            }}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              marginLeft: 4,
              letterSpacing: 1,
            }}
          >
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
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: Colors.dark,
              fontWeight: "bold",
              fontSize: 13,
              marginRight: 4,
            }}
          >
            {filterLocality ||
              filterDistrict ||
              t("location.all", "All Locations")}
          </Text>
          <Ionicons name="chevron-down" size={14} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Search + filter row */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={navToSearch}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: Colors.border,
            height: 48,
            borderRadius: 24,
            paddingHorizontal: 16,
          }}
        >
          <Ionicons
            name="search"
            size={20}
            color={Colors.muted}
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: Colors.muted, fontSize: 15 }}>
            {t("search.placeholder", "Search locality, area...")}
          </Text>
        </TouchableOpacity>
        <FilterButton onPress={() => setFilterSheetVisible(true)} size={48} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.yellow]}
            tintColor={Colors.yellow}
          />
        }
      >
        {/* Quick filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 8,
            paddingBottom: 16,
          }}
        >
          {types.map((mod, idx) => {
            const isActive = filterType === mod.value;
            const isFeatured = featuredTypes.includes(mod.value);
            return (
              <TouchableOpacity
  key={mod.value}
  onPress={() => setFilter({ type: mod.value })}
  activeOpacity={0.8}
  style={{
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,

    backgroundColor: isActive
      ? Colors.yellow
      : isFeatured
      ? "#FFF3E0"
      : Colors.white,

    borderWidth: isActive ? 1.5 : 1,
    borderColor: isActive
      ? Colors.dark
      : isFeatured
      ? "#FFD59E"
      : Colors.border,
  }}
>
  {/* ⭐ Featured icon */}
  {isFeatured && !isActive && (
    <Ionicons
      name="star"
      size={12}
      color="#FF9800"
      style={{ marginRight: 6 }}
    />
  )}

  {/* Label */}
  <Text
    style={{
      color: isActive
        ? Colors.dark
        : isFeatured
        ? "#8A5A00"
        : Colors.muted,
      fontWeight: isActive ? "bold" : "600",
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
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: Colors.dark }}
              >
                {t("home.featured", "Featured Properties")}
              </Text>
              {/* <TouchableOpacity onPress={navToSearch}>
                <Text
                  style={{
                    fontSize: 13,
                    color: Colors.muted,
                    fontWeight: "600",
                  }}
                >
                  {t("home.see_all", "See all →")}
                </Text>
              </TouchableOpacity> */}
            </View>
            {/* <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
              snapToInterval={306} // 290 width + 16 margin
              decelerationRate="fast"
            > */}
              {featuredProperties.map((prop) => (
                <FeaturedPropertyCard
                  key={prop.id}
                  property={prop}
                  onPress={navToProperty}
                />
              ))}
            {/* </ScrollView> */}
          </View>
        )}

        {/* Latest feed */}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: Colors.dark }}
            >
              {filterLocality
                ? t("home.latest_in", "Latest in {{area}}", {
                    area: filterLocality,
                  })
                : filterDistrict
                  ? t("home.latest_near_you", "Latest Near You")
                  : t("home.latest_properties", "Latest Properties")}
            </Text>
            {/* <TouchableOpacity onPress={navToSearch}>
              <Text
                style={{ fontSize: 13, color: Colors.muted, fontWeight: "600" }}
              >
                {t("home.see_all", "See all →")}
              </Text>
            </TouchableOpacity> */}
          </View>

          {feedLoading ? (
            <ActivityIndicator
              size="large"
              color={Colors.yellow}
              style={{ marginTop: 24 }}
            />
          ) : feedProperties.length > 0 ? (
            feedProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onPress={navToProperty}
              />
            ))
          ) : (
            renderEmptyState()
            // <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            //   <Ionicons name="search-outline" size={48} color={Colors.lightMuted} />
            //   <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.dark, marginTop: 12 }}>
            //     {t('home.empty_feed', 'No properties found in this area.')}
            //   </Text>
            //   <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 4, textAlign: 'center', paddingHorizontal: 12 }}>
            //     {t('home.empty_feed_sub', 'Try selecting a different filter or search in a different area.')}
            //   </Text>
            // </View>
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

      {/* AI Assistant FAB */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: fabBottom,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: Colors.yellow,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 4,
          elevation: 4,
        }}
        onPress={() => router.push("/assistant" as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color={Colors.dark} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
