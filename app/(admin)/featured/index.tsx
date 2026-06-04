import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { adminPropertiesApi } from "@api/admin-properties.api";
import { PropertyDto } from "@api/types";
import { formatPrice } from "@utils/price";
import { router, useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import { FeatureConfigBottomSheet } from "@/components/admin/FeatureConfigBottomSheet";

export default function FeaturedDashboardScreen() {
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReordering, setIsReordering] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDto | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const fetchFeatured = useCallback(async () => {
    try {
      const { data } = await adminPropertiesApi.getAdminFeatured();
      setProperties(data.data);
    } catch (e: any) {
      console.error(e);
      Toast.show({
        type: "error",
        text1: "Error fetching featured properties",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFeatured();
    }, [fetchFeatured])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFeatured();
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    setIsReordering(id);
    try {
      await adminPropertiesApi.reorderFeatured(id, direction);
      await fetchFeatured();
    } catch (e: any) {
      console.error(e);
      Toast.show({
        type: "error",
        text1: "Failed to reorder",
      });
    } finally {
      setIsReordering(null);
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      "Remove Featured",
      "Are you sure you want to remove this property from the featured list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await adminPropertiesApi.setFeatured(id, { isFeatured: false });
              await fetchFeatured();
              Toast.show({ type: "success", text1: "Removed successfully" });
            } catch (e: any) {
              console.error(e);
              Toast.show({ type: "error", text1: "Failed to remove" });
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.dark} />
      </View>
    );
  }

  const now = new Date().getTime();
  const active = properties.filter(
    (p) => !p.featuredUntil || new Date(p.featuredUntil).getTime() > now
  );
  const expired = properties.filter(
    (p) => p.featuredUntil && new Date(p.featuredUntil).getTime() <= now
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Featured Properties</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: Colors.surface }]}>
            <Text style={styles.summaryValue}>{properties.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.yellow + "40" }]}>
            <Text style={styles.summaryValue}>{active.length}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: Colors.error + "20" }]}>
            <Text style={styles.summaryValue}>{expired.length}</Text>
            <Text style={styles.summaryLabel}>Expired</Text>
          </View>
        </View>

        {/* Active Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Featured</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/(admin)/featured/add" as any)}
          >
            <Ionicons name="add" size={16} color={Colors.white} />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {active.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No active featured properties.</Text>
          </View>
        ) : (
          active.map((p, index) => (
            <AdminFeaturedCard
              key={p.id}
              property={p}
              isActive={true}
              isFirst={index === 0}
              isLast={index === active.length - 1}
              onMoveUp={() => handleReorder(p.id, "up")}
              onMoveDown={() => handleReorder(p.id, "down")}
              onEdit={() => {
                setSelectedProperty(p);
                setIsSheetVisible(true);
              }}
              onRemove={() => handleRemove(p.id)}
              isLoading={isReordering === p.id}
            />
          ))
        )}

        {/* Expired Section */}
        {expired.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>Expired</Text>
            </View>
            {expired.map((p) => (
              <AdminFeaturedCard
                key={p.id}
                property={p}
                isActive={false}
                isFirst={false}
                isLast={false}
                onEdit={() => {
                  setSelectedProperty(p);
                  setIsSheetVisible(true);
                }}
                onRemove={() => handleRemove(p.id)}
                isLoading={false}
              />
            ))}
          </>
        )}
      </ScrollView>

      <FeatureConfigBottomSheet
        visible={isSheetVisible}
        property={selectedProperty}
        onClose={() => {
          setIsSheetVisible(false);
          setSelectedProperty(null);
        }}
        onSuccess={fetchFeatured}
      />
    </SafeAreaView>
  );
}

function AdminFeaturedCard({
  property,
  isActive,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
  isLoading,
}: {
  property: PropertyDto;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  isLoading: boolean;
}) {
  const cover =
    property.propertyMedia?.find((m) => m.isCover)?.media?.url ||
    property.propertyMedia?.[0]?.media?.url;

  return (
    <View style={[styles.card, !isActive && styles.cardExpired]}>
      <View style={styles.cardContent}>
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
            {property.title || `${property.type} for ${property.transactionType}`}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {property.locality}, {property.district}
          </Text>
          <Text style={styles.cardPrice}>{formatPrice(property.price)}</Text>
          
          <View style={styles.badgesRow}>
            {isActive ? (
              <View style={styles.badgeActive}>
                <Text style={styles.badgeTextActive}>
                  Position {property.featuredOrder}
                </Text>
              </View>
            ) : (
              <View style={styles.badgeExpired}>
                <Text style={styles.badgeTextExpired}>Expired</Text>
              </View>
            )}
            
            {property.featuredUntil && (
              <Text style={styles.untilText}>
                Until {new Date(property.featuredUntil).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        {isActive && (
          <View style={styles.reorderActions}>
            <TouchableOpacity
              style={[styles.iconBtn, isFirst && styles.iconBtnDisabled]}
              disabled={isFirst || isLoading}
              onPress={onMoveUp}
            >
              <Ionicons name="arrow-up" size={18} color={isFirst ? Colors.muted : Colors.dark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, isLast && styles.iconBtnDisabled]}
              disabled={isLast || isLoading}
              onPress={onMoveDown}
            >
              <Ionicons name="arrow-down" size={18} color={isLast ? Colors.muted : Colors.dark} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="pencil" size={16} color={Colors.dark} />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtnDanger} onPress={onRemove}>
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    flex: 1,
    textAlign: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, paddingBottom: 60 },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
    textTransform: "uppercase",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    alignItems: "center",
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardExpired: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: "row",
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
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeActive: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextActive: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.dark,
  },
  badgeExpired: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTextExpired: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.muted,
  },
  untilText: {
    fontSize: 11,
    color: Colors.muted,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  reorderActions: {
    flexDirection: "row",
    gap: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBtnDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.surface,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark,
  },
  actionBtnDanger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error + "15",
    justifyContent: "center",
    alignItems: "center",
  },
});
