import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { PropertyDto } from "@api/types";
import { Colors } from "@constants/colors";
import { formatPrice } from "@utils/price";
import { PropertyTypeEnum } from "@/common/enums/property-enums/property-type.enum";
import { PriceUnitEnum } from "@/common/enums/property-enums/price-unit.enum";
import { useToggleSave } from "@/hooks/useProperties";
import { useAuthStore } from "@/store/auth.store";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export interface FeaturedPropertyCardProps {
  property: PropertyDto;
  onPress?: (id: string) => void;
}

export const FeaturedPropertyCard: React.FC<FeaturedPropertyCardProps> = ({
  property,
  onPress,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const requireAuth = useRequireAuth();
  const toggleSave = useToggleSave();

  const isSaved = property.isSaved ?? false;
  const isTogglingSave =
    toggleSave.isPending && toggleSave.variables === property.id;

  const handleSaveToggle = () => {
    requireAuth(() => toggleSave.mutate(property.id));
  };

  const coverImage =
    property.propertyMedia?.find((m) => m.isCover)?.media?.url ??
    property.propertyMedia?.[0]?.media?.url;

  const ownerName = property.lister?.name ?? "Owner";

  const ownerImage = property?.lister?.profileMedia?.url ?? null;

  const formatPriceUnit = (unit: PriceUnitEnum) => {
    const map: Record<PriceUnitEnum, string> = {
      [PriceUnitEnum.PER_MONTH]: "/mo",
      [PriceUnitEnum.PER_NIGHT]: "/night",
      [PriceUnitEnum.PER_ACRE]: "/acre",
      [PriceUnitEnum.PER_CENT]: "/cent",
      [PriceUnitEnum.PER_SQFT]: "/sqft",
      [PriceUnitEnum.PER_SQM]: "/sqm",
      [PriceUnitEnum.TOTAL]: "total",
    };
    return map[unit] ?? "";
  };

  const getDisplayType = () => {
    switch (property.type) {
      case PropertyTypeEnum.HOUSE:
        return 'House';
      case PropertyTypeEnum.LAND:
        return 'Land';
      case PropertyTypeEnum.BUILDING:
        return property.buildingDetail?.subType ? property.buildingDetail.subType.replace('_', ' ') : 'Building';
      case PropertyTypeEnum.HOTEL:
        return property.hotelDetail?.subType ? property.hotelDetail.subType.replace('_', ' ') : 'Hotel/PG';
      default:
        return property.type;
    }
  };

  type Pill = { icon: keyof typeof Ionicons.glyphMap; label: string };

  const pills = (): Pill[] => {
    switch (property.type) {
      case PropertyTypeEnum.LAND:
        return [
          ...(property.landDetail?.totalArea
            ? [
                {
                  icon: "resize-outline" as const,
                  label: `${parseFloat(property.landDetail.totalArea)} ${property.landDetail.areaUnit ?? "Unit"}`,
                },
              ]
            : []),
        ];
      case PropertyTypeEnum.HOUSE:
        return [
          ...(property.houseDetail?.bedrooms
            ? [
                {
                  icon: "bed-outline" as const,
                  label: `${property.houseDetail.bedrooms} Beds`,
                },
              ]
            : []),
          ...(property.houseDetail?.bathrooms
            ? [
                {
                  icon: "water-outline" as const,
                  label: `${property.houseDetail.bathrooms} Baths`,
                },
              ]
            : []),
          ...(property.houseDetail?.floors
            ? [
                {
                  icon: "business-outline" as const,
                  label: `${property.houseDetail.floors} ${property.houseDetail.floors === 1 ? "Floor" : "Floors"}`,
                },
              ]
            : []),
        ];
      case PropertyTypeEnum.BUILDING:
        return [
          ...(property.buildingDetail?.totalArea
            ? [
                {
                  icon: "resize-outline" as const,
                  label: `${Number(property.buildingDetail.totalArea)} ${property.buildingDetail.areaUnit ?? "Unit"}`,
                },
              ]
            : []),
          ...(property.buildingDetail?.floorNumber
            ? [
                {
                  icon: "layers-outline" as const,
                  label: `${property.buildingDetail.floorNumber} ${property.buildingDetail.floorNumber === 1 ? "Floor" : "Floors"}`,
                },
              ]
            : []),
        ];
      case PropertyTypeEnum.HOTEL:
        return [
          ...(property.hotelDetail?.roomType
            ? [
                {
                  icon: "bed-outline" as const,
                  label: property.hotelDetail.roomType,
                },
              ]
            : []),
        ];
      default:
        return [];
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress?.(property.id)}
      style={{
        // width: 290,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 0.5,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        marginVertical: 6,
      }}
    >
      {/* ── Hero image ── */}
      <View style={{ height: 230, backgroundColor: Colors.white, padding: 5 }}>
        {coverImage ? (
          <View>
            <Image
              source={{ uri: coverImage }}
              style={{ width: "100%", height: "100%", borderRadius: 15 }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.72)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 120,
                borderRadius: 15,
              }}
            />
          </View>
        ) : (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons
              name="camera-outline"
              size={36}
              color={Colors.lightMuted}
            />
            <Text
              style={{ color: Colors.lightMuted, marginTop: 8, fontSize: 13 }}
            >
              {t("property.no_photos")}
            </Text>
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.72)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 120,
                borderRadius: 15,
              }}
            />
          </View>
        )}

        {/* Top-left badge — Featured only */}
        <View style={{ position: "absolute", top: 12, left: 12, flexDirection: "row", gap: 6 }}>
          {/* Featured badge */}
          <View
            style={{
              backgroundColor: "#F5C249",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: "#2a1e00",
                letterSpacing: 0.6,
              }}
            >
              ✦ FEATURED
            </Text>
          </View>
        </View>

        {/* Owner pill — top right */}
        {/* <View
          style={{
            position: "absolute", top: 12, right: 52,
            backgroundColor: "rgba(0,0,0,0.45)",
            paddingHorizontal: 10, paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "500", color: "#fff" }}>
            {ownerName}
          </Text>
        </View> */}

        {/* Save toggle — top right */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleSaveToggle();
          }}
          disabled={isTogglingSave}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(0,0,0,0.45)",
            alignItems: "center",
            justifyContent: "center",
            opacity: isTogglingSave ? 0.6 : 1,
          }}
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={17}
            color={isSaved ? "#F5C249" : "#fff"}
          />
        </TouchableOpacity>

        {/* Price + type/transaction pill — overlaid on gradient */}
        <View
          style={{
            position: "absolute",
            bottom: 12,
            left: 14,
            right: 14,
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: "#fff",
                lineHeight: 30,
              }}
            >
              {formatPrice(property.price)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
                marginTop: 1,
              }}
            >
              {formatPriceUnit(property.priceUnit)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              borderWidth: 0.5,
              borderColor: "rgba(255,255,255,0.35)",
              backgroundColor: "rgba(255,255,255,0.15)",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: "#fff",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {getDisplayType()}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              ·
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "500",
                color: "rgba(255,255,255,0.85)",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {property.transactionType}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={{ padding: 14 }}>
        {/* Title */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: Colors.dark,
            marginBottom: 4,
          }}
        >
          {property.title || `${property.type} for ${property.transactionType}`}
        </Text>

        {/* Location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginBottom: 10,
          }}
        >
          <Ionicons name="location-outline" size={13} color={Colors.muted} />
          <Text
            numberOfLines={1}
            style={{ fontSize: 12, color: Colors.muted, flex: 1 }}
          >
            {property.locality}, {property.district}
          </Text>
        </View>

        {/* Pills */}
        {pills().length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 14,
            }}
          >
            {pills().map((p, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: Colors.surface,
                  borderWidth: 0.5,
                  borderColor: Colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Ionicons name={p.icon} size={12} color={Colors.muted} />
                <Text
                  style={{
                    fontSize: 11,
                    color: Colors.muted,
                    fontWeight: "500",
                  }}
                >
                  {p.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        {/* <TouchableOpacity
          onPress={() => onPress?.(property.id)}
          style={{
            backgroundColor: "#1a1a2e",
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: "center",
          }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff", letterSpacing: 0.3 }}>
            View Details →
          </Text>
        </TouchableOpacity> */}
      </View>
    </TouchableOpacity>
  );
};