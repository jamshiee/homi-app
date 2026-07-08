import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { PropertyDto } from "@api/types";
import { Colors } from "@constants/colors";
import { formatPrice } from "@utils/price";
import { PropertyTypeEnum } from "@/common/enums/property-enums/property-type.enum";
import { PriceUnitEnum } from "@/common/enums/property-enums/price-unit.enum";
import { LinearGradient } from "expo-linear-gradient";
import { useToggleSave } from "@/hooks/useProperties";
import { useAuthStore } from "@/store/auth.store";
import { ModerationPanel } from "./common/ModerationPanel";

export interface PropertyCardProps {
  property: PropertyDto;
  onPress?: (id: string) => void;
  showActions?: boolean;
  showModerationStatus?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  showActions = false,
  showModerationStatus = false,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const toggleSave = useToggleSave();

  const isSaved = property.isSaved ?? false;
  const isTogglingSave =
    toggleSave.isPending && toggleSave.variables === property.id;

  const handleSaveToggle = () => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: t("saved.login_required", "Sign in to view saved properties"),
      });
      router.push("/(auth)/phone");
      return;
    }
    toggleSave.mutate(property.id);
  };

  const formatPriceUnit = (unit: PriceUnitEnum) => {
    const map: Record<PriceUnitEnum, string> = {
      [PriceUnitEnum.PER_MONTH]: "per month",
      [PriceUnitEnum.PER_NIGHT]: "per night",
      [PriceUnitEnum.PER_ACRE]: "per acre",
      [PriceUnitEnum.PER_CENT]: "per cent",
      [PriceUnitEnum.PER_SQFT]: "per sqft",
      [PriceUnitEnum.PER_SQM]: "per sqm",
      [PriceUnitEnum.TOTAL]: "total price",
    };
    return map[unit] ?? "";
  };

  const coverImage =
    property.propertyMedia?.find((m) => m.isCover)?.media?.url ??
    property.propertyMedia?.[0]?.media?.url;

  const ownerName = property.lister?.name ?? "Owner";
  const ownerImage = property?.lister?.profileMedia?.url ?? null;

  const ownerInitials = ownerName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

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
          ...(property.buildingDetail?.currentStatus
            ? [
                {
                  icon: "home-outline" as const,
                  label: property.buildingDetail.currentStatus.replaceAll(
                    "_",
                    " ",
                  ),
                },
              ]
            : []),
        ];

  case PropertyTypeEnum.HOTEL:
    const categoryIconMap = {
  luxury: 'diamond-outline' as const,
  premium: 'ribbon-outline' as const,
  classic: 'star-outline' as const,
};
  return [
    ...(property.hotelDetail?.hotelCategory
      ? [
          {
            icon:
              categoryIconMap[property.hotelDetail.hotelCategory] ??
              ('star-outline' as const),
            label: property.hotelDetail.hotelCategory,
          },
        ]
      : []),
          ...(property.hotelDetail?.subType
      ? [
          {
            icon: 'business-outline' as const,
            label: property.hotelDetail.subType,
          },
        ]
      : []),
    ...(property.hotelDetail?.roomType
      ? [
          {
            icon: 'bed-outline' as const,
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
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 0.5,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
      }}
    >
      {/* ── Hero image ── */}

      <View style={{ height: 240, backgroundColor: Colors.white, padding: 10 }}>
        <View
          style={{
            flex: 1,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#1a1a2e",
          }}
        >
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Ionicons
                name="camera-outline"
                size={32}
                color={Colors.lightMuted}
              />
              <Text style={{ fontSize: 13, color: Colors.lightMuted }}>
                {t("property.no_photos")}
              </Text>
            </View>
          )}

          {/* Gradient overlay (bottom-up) */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.72)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
            }}
          />

          {/* Transaction type badge — top left */}
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor:
                property.transactionType === "rent" ? "#0F6E56" : "#1a1a2e",
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
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              For {property.transactionType}
            </Text>
          </View>

          {/* Top-right: verified badge OR save toggle */}
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >

            {/* Save toggle — shown when not in actions (edit/delete) mode */}
            {!showActions && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleSaveToggle();
                }}
                disabled={isTogglingSave}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
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
                  size={18}
                  color={isSaved ? "#F5C249" : "#fff"}
                />
              </TouchableOpacity>
            )}
          </View>

          <View
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            {property.isVerified && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#16A34A",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="checkmark-circle" size={12} color="#fff" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "700",
                    marginLeft: 4,
                    letterSpacing: 0.5,
                  }}
                >
                  VERIFIED
                </Text>
              </View>
            )}


          </View>

          

          {/* Price — anchored to bottom of image */}
          <View
            style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#fff",
                lineHeight: 28,
              }}
            >
              {formatPrice(property.price)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                marginTop: 1,
              }}
            >
              {formatPriceUnit(property.priceUnit)}
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
            fontSize: 21,
            fontWeight: "700",
            color: Colors.dark,
            marginBottom: 4,
          }}
        >
          {property.title || `${property.type} for ${property.transactionType}`}
        </Text>

        {/* Location + Owner row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              flex: 1,
              minWidth: 0,
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

          {/* <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginLeft: 8,
              flexShrink: 0,
            }}
          >
            <Text
              style={{ fontSize: 11, color: Colors.muted, fontWeight: "500" }}
            >
              {ownerName}
            </Text>
               <View className="">
              {ownerImage ? (
                <Image
                  source={{ uri: ownerImage }}
                  className="h-8 w-8 rounded-full border border-gray-200"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                  <Text className="text-[16px] font-bold text-black">
                    {ownerName[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View> */}
        </View>

        {/* Divider */}
        <View
          style={{
            height: 0.5,
            backgroundColor: Colors.border,
            marginBottom: 12,
          }}
        />

        {/* Pills */}
        {pills().length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 12,
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
                  className="capitalize"
                >
                  {p.label}
                </Text>
              </View>
            ))}
          </View>
        )}

                {showModerationStatus &&
 property.moderationStatus !== "approved" && (
    <ModerationPanel
        status={property.moderationStatus}
        reason={property.rejectionReason}
    />
)}

        {/* Footer buttons */}
        {showActions && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => onEdit?.(property.id)}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 10,
                borderWidth: 0.5,
                borderColor: Colors.border,
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={18} color={Colors.dark} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete?.(property.id)}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: Colors.error,
                alignItems: "center",
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="trash" size={18} color={"#fff"} />
            </TouchableOpacity>
          </View>
        )}


      </View>
    </TouchableOpacity>
  );
};
