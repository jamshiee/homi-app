import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { adminPropertiesApi } from "@api/admin-properties.api";
import { PropertyDto } from "@api/types";
import { formatPrice } from "@utils/price";
import { PropertyFilter } from "@api/properties.api";
import { FeatureConfigBottomSheet } from "@/components/admin/FeatureConfigBottomSheet";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

export default function AddFeaturedScreen() {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<PropertyFilter>({ limit: 15 });

  const [selectedProperty, setSelectedProperty] = useState<PropertyDto | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const fetchProperties = useCallback(
    async (pageNum: number, currentFilters: PropertyFilter, isRefresh = false) => {
      if (isRefresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const { data } = await adminPropertiesApi.getAdminAll({
          ...currentFilters,
          page: pageNum,
        });

        const newItems = data.data;
        if (isRefresh) {
          setProperties(newItems);
        } else {
          setProperties((prev) => [...prev, ...newItems]);
        }
        
        setHasMore(newItems.length >= (currentFilters.limit || 15));
        setPage(pageNum);
      } catch (e) {
        console.error(e);
        Toast.show({ type: "error", text1: "Failed to search properties" });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    // Initial fetch
    fetchProperties(1, filters, true);
  }, []);

  const handleSearch = () => {
    const newFilters = { ...filters, keyword: keyword.trim() || undefined };
    setFilters(newFilters);
    fetchProperties(1, newFilters, true);
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchProperties(page + 1, filters, false);
    }
  };

  const renderItem = ({ item }: { item: PropertyDto }) => {
    const cover =
      item.propertyMedia?.find((m) => m.isCover)?.media?.url ||
      item.propertyMedia?.[0]?.media?.url;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedProperty(item);
          setIsSheetVisible(true);
        }}
      >
        <View style={styles.cardImageContainer}>
          {cover ? (
            <Image source={{ uri: cover }} style={styles.cardImage} />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={24} color={Colors.muted} />
            </View>
          )}
        </View>

        <View style={styles.cardDetails}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || `${item.type} for ${item.transactionType}`}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.locality}, {item.district}
          </Text>
          <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>

          {item.isFeatured && (
            <View style={styles.badgeFeatured}>
              <Ionicons name="star" size={12} color={Colors.dark} />
              <Text style={styles.badgeTextFeatured}>Featured</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, title, locality..."
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {keyword.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setKeyword("");
                const newFilters = { ...filters, keyword: undefined };
                setFilters(newFilters);
                fetchProperties(1, newFilters, true);
              }}
            >
              <Ionicons name="close-circle" size={20} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.dark} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color={Colors.dark} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No properties found.</Text>
            </View>
          }
        />
      )}

      <FeatureConfigBottomSheet
        visible={isSheetVisible}
        property={selectedProperty}
        onClose={() => {
          setIsSheetVisible(false);
          setSelectedProperty(null);
        }}
        onSuccess={() => {
          setIsSheetVisible(false)
          setSelectedProperty(null)
          // Refresh the list to reflect updated featured status
          fetchProperties(1, filters, true);
          router.back()
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  searchHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.dark,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    padding: 12,
  },
  cardImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.dark,
  },
  badgeFeatured: {
    position: "absolute",
    bottom: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  badgeTextFeatured: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.dark,
  },
  emptyBox: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 14,
  },
});
