import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { PropertyDto } from "@api/types";
import { Colors } from "@constants/colors";
import { formatPrice } from "@utils/price";

export interface FeaturedPropertyCardProps {
  property: PropertyDto;
  onPress?: (id: string) => void;
  onSaveToggle?: (id: string) => void;
  isSaved?: boolean;
  onWhatsAppPress?: (property: PropertyDto) => void;
  onCallPress?: (property: PropertyDto) => void;
  onViewNumberPress?: (property: PropertyDto) => void;
}

export const FeaturedPropertyCard: React.FC<FeaturedPropertyCardProps> = ({
  property,
  onPress,
  onSaveToggle,
  isSaved = false,
  onWhatsAppPress,
  onCallPress,
  onViewNumberPress,
}) => {
  const { t } = useTranslation();

  const coverImage =
    property.propertyMedia?.find((m) => m.isCover)?.media?.url ??
    property.propertyMedia?.[0]?.media?.url;

  const ownerName =
    property.listedByUser?.name ?? property.lister?.name ?? "Owner";

  const moduleRow = (): string => {
    switch (property.type) {
      case "land":
        return `${property.landDetail?.totalArea ?? 0} ${property.landDetail?.areaUnit ?? "Cents"}`;
      case "house":
        return `${property.houseDetail?.bedrooms ?? 0} BHK · ${property.houseDetail?.bathrooms ?? 0} Bath`;
      case "building":
        return `${property.buildingDetail?.totalArea ?? 0} sqft · Floor ${property.buildingDetail?.floorNumber ?? 0}`;
      case "hotel":
        return `${property.hotelDetail?.roomType ?? "Single"} · ${property.hotelDetail?.subType ?? "Lodge"}`;
      default:
        return "";
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(property.id)}
      style={{
        width: 290,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: Colors.border,
        marginHorizontal: 8,
        overflow: "hidden",
      }}
    >
      {/* Hero image — taller than standard card */}
      <View
        style={{
          height: 200,
          backgroundColor: Colors.surface,
          position: "relative",
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
              {t("property.no_photos", "No photos")}
            </Text>
          </View>
        )}

        {/* Featured badge — bottom-left per design spec */}
        <View
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            backgroundColor: Colors.yellow,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{ color: Colors.dark, fontSize: 11, fontWeight: "bold" }}
          >
            {t("property.featured", "Featured")}
          </Text>
        </View>

        {/* Owner pill — top-left */}
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            backgroundColor: Colors.overlay,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{ color: Colors.white, fontSize: 11, fontWeight: "500" }}
          >
            {ownerName}
          </Text>
        </View>

        {/* Save icon — top-right */}
        <TouchableOpacity
          onPress={() => onSaveToggle?.(property.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: Colors.overlay,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={18}
            color={isSaved ? Colors.yellow : Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 4 }}>
          {moduleRow()}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: Colors.dark,
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {property.title || `${property.type} for ${property.transactionType}`}
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: Colors.dark,
            marginBottom: 8,
          }}
        >
          {formatPrice(property.price)}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons
            name="location-outline"
            size={13}
            color={Colors.muted}
            style={{ marginRight: 4 }}
          />
          <Text style={{ fontSize: 12, color: Colors.muted }} numberOfLines={1}>
            {property.locality}, {property.district}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          <TouchableOpacity
            onPress={() => onWhatsAppPress?.(property)}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: "#25D366",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ color: "#25D366", fontWeight: "bold", fontSize: 12 }}
            >
              WhatsApp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onViewNumberPress?.(property)}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: Colors.dark,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ color: Colors.dark, fontWeight: "bold", fontSize: 12 }}
            >
              {t("property.view_number", "View Number")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onCallPress?.(property)}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 18,
              backgroundColor: Colors.dark,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{ color: Colors.white, fontWeight: "bold", fontSize: 12 }}
            >
              {t("property.call", "Call")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};
