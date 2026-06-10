import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { useFilterStore, PropertyType } from "@store/filter.store";
import { usePropertyFeed } from "@hooks/useProperties";
import { PropertyCard } from "@components/PropertyCard";
import { PropertyDto } from "@api/types";
import { FilterBottomSheet } from "@components/FilterBottomSheet";
import { FilterButton } from "@components/FilterButton";
import { useActiveFilters } from "@hooks/useActiveFilters";
import { LocationBottomSheet } from "@components/LocationBottomSheet";
import { TransactionTypeFilter } from "@/common/enums/transaction-type-filter.enum";
import { useAuthStore } from "@/store/auth.store";

export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  // Store
  const filterState = useFilterStore();
  const { type, setFilter, resetFilters } = filterState;
  const {user} = useAuthStore();

  // Local State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [locationVisible, setLocationVisible] = useState(false);

  const activeFilters = useActiveFilters();

  // Configure layout animation for android 
  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Animate changes in active filters count
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeFilters.length]);

  // Fetch data
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    usePropertyFeed({
      type: type !== "all" ? type : undefined,
      keyword: searchQuery || undefined,
      district: filterState.district,
      transactionType:
        filterState.transactionType !== TransactionTypeFilter.ALL
          ? filterState.transactionType
          : undefined,
      minPrice: filterState.minPrice,
      maxPrice: filterState.maxPrice,
      bedrooms: filterState.bedrooms,
      bathrooms: filterState.bathrooms,
      furnishingStatus: filterState.furnishingStatus,
      minArea: filterState.minArea,
      maxArea: filterState.maxArea,
      areaUnit: filterState.areaUnit,
      buildingSubtype: filterState.buildingSubtype,
      roomType: filterState.roomType,
    });

  const properties =
    data?.pages.flatMap((p) => p.data.data as PropertyDto[]) || [];
  const totalCount = data?.pages[0]?.data.meta?.total || 0;

  const modules: { label: string; value: PropertyType }[] = [
    { label: t("modules.all", "All"), value: "all" },
    { label: t("modules.land", "Land/Plot"), value: "land" },
    { label: t("modules.house", "House"), value: "house" },
    { label: t("modules.building", "Building"), value: "building" },
    { label: t("modules.hotel", "Hotel/PG"), value: "hotel" },
  ];

  const handleBack = () => {
    router.back();
  };

  const navToProperty = (id: string) => {
    router.push(`/property/${id}`);
  };

  // Debounce logic for search input
  const [inputValue, setInputValue] = useState(searchQuery);
  const inputRef = useRef<TextInput>(null);
  const { focus } = useLocalSearchParams();

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // Handle focusing input if routed from index
  useEffect(() => {
    if (focus === "true") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // slight delay for transition
      router.setParams({ focus: "false" });
    }
  }, [focus, router]);

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
            area: filterState.district || "this area",
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
            "Try searching a nearby locality or clearing your filters"
          )}
        </Text>

        <TouchableOpacity
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
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
        <Ionicons
          name="home-outline"
          size={64}
          color={Colors.lightMuted}
        />

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
                "There are no properties yet. Create the first listing."
              )
            : t(
                "home.no_properties_available",
                "There are no properties available at the moment. Please check back later."
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
      {/* Top Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: Colors.surface,
          gap: 12,
        }}
      >
        <TouchableOpacity onPress={handleBack} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 24,
            height: 44,
            paddingHorizontal: 12,
          }}
        >
          <Ionicons
            name="search"
            size={18}
            color={Colors.muted}
            style={{ marginRight: 8 }}
          />
          <TextInput
            ref={inputRef}
            style={{ flex: 1, fontSize: 15, color: Colors.dark }}
            placeholder={t("search.placeholder", "Search locality, area...")}
            placeholderTextColor={Colors.muted}
            value={inputValue}
            onChangeText={setInputValue}
            autoFocus={false}
          />
          {inputValue.length > 0 && (
            <TouchableOpacity onPress={() => setInputValue("")}>
              <Ionicons name="close-circle" size={18} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        <FilterButton onPress={() => setFilterVisible(true)} size={44} />
      </View>

      {/* Filter Tabs */}
      {/* <View style={{ backgroundColor: Colors.surface }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 24 }}
        >
          {modules.map((mod) => {
            const isActive = type === mod.value;
            return (
              <TouchableOpacity
                key={mod.value}
                onPress={() => setFilter({ type: mod.value })}
                style={{
                  paddingBottom: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? Colors.yellow : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: isActive ? Colors.dark : Colors.muted,
                    fontWeight: isActive ? 'bold' : '500',
                    fontSize: 14,
                  }}
                >
                  {mod.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View> */}

      {/* Filter Row */}
      <View style={{ paddingVertical: 12, backgroundColor: Colors.surface }}>
        {activeFilters.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 8,
              alignItems: "center",
            }}
          >
            {/* Show first 3 active filters as pills */}
            {activeFilters.slice(0, 3).map((filter) => (
              <View
                key={filter.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  paddingLeft: 12,
                  paddingRight: 8,
                  paddingVertical: 6,
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 1,
                  elevation: 0.5,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: Colors.dark,
                    fontWeight: "500",
                  }}
                >
                  {filter.label}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut,
                    );
                    filter.clear();
                  }}
                  style={{
                    marginLeft: 6,
                    padding: 2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={14}
                    color={Colors.lightMuted}
                  />
                </TouchableOpacity>
              </View>
            ))}

            {/* If more than 3 filters, show a "+N" pill */}
            {activeFilters.length > 3 && (
              <TouchableOpacity
                onPress={() => setFilterVisible(true)}
                style={{
                  backgroundColor: Colors.yellow,
                  borderWidth: 1,
                  borderColor: Colors.dark,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: Colors.dark,
                    fontWeight: "bold",
                  }}
                >
                  +{activeFilters.length - 3}
                </Text>
              </TouchableOpacity>
            )}

            {/* Clear All button */}
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                resetFilters();
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: Colors.border,
                backgroundColor: "rgba(239, 68, 68, 0.05)",
              }}
            >
              <Text
                style={{ fontSize: 13, color: Colors.error, fontWeight: "600" }}
              >
                {t("filter.clear_all", "Clear All")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 8,
              alignItems: "center",
            }}
          >
            {/* Quick shortcuts when no filters are active */}
            <TouchableOpacity
              onPress={() => setFilterVisible(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >

                <Ionicons
                  name="funnel-outline"
                  size={16}
                  color={Colors.dark}
                />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLocationVisible(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >

                <Ionicons
                  name="location-outline"
                  size={16}
                  color={Colors.dark}
                />
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setFilter({ transactionType: TransactionTypeFilter.BUY });
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <Text
                style={{ fontSize: 13, color: Colors.dark, fontWeight: "500" }}
              >
                For Buy 🏷️
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setFilter({ transactionType: TransactionTypeFilter.RENT });
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.border,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
              }}
            >
              <Text
                style={{ fontSize: 13, color: Colors.dark, fontWeight: "500" }}
              >
                For Rent 🔑
              </Text>
            </TouchableOpacity> */}
          </ScrollView>
        )}
      </View>

      {/* Result Count */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 13, color: Colors.muted }}>
          {totalCount} {t("search.properties", "properties")}
        </Text>
      </View>

      {/* Feed */}
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.yellow}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={properties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PropertyCard property={item} onPress={navToProperty} />
            )}
            contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 4 }}
            ListEmptyComponent={renderEmptyState}
            onEndReached={() => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.yellow}
                  style={{ marginVertical: 16 }}
                />
              ) : null
            }
          />
        )}
      </View>

      <FilterBottomSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
      <LocationBottomSheet
        visible={locationVisible}
        onClose={() => setLocationVisible(false)}
      />
    </SafeAreaView>
  );
}
