import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { usePostStore } from "../../store/postStore";
import { Colors } from "../../constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { apiClient, uploadClient } from "../../api/client";
import { propertiesApi } from "../../api/properties.api";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../hooks/useProperties";
import * as ImageManipulator from "expo-image-manipulator";

interface AmenityData {
  id: string;
  nameEn: string;
  iconName: string;
}

export default function Step7Review() {
  const {
    type,
    title,
    transactionType,
    district,
    locality,
    address,
    latitude,
    longitude,
    price,
    isNegotiable,
    isVerified,
    advanceAmount,
    priceUnit,
    description,
    contactPhone,
    alternatePhone,
    landDetail,
    houseDetail,
    buildingDetail,
    hotelDetail,
    amenityIds,
    photos,
    isEditMode,
    editingPropertyId,
    editSnapshot,
    resetForm,
  } = usePostStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [amenitiesMap, setAmenitiesMap] = useState<Record<string, AmenityData>>(
    {},
  );
  const queryClient = useQueryClient();

  /** Compress a local URI to JPEG ≤ 1024px wide, 75% quality before uploading */
  const compressImage = async (uri: string): Promise<string> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG },
      );
      return result.uri;
    } catch {
      return uri; // fall back to original on error
    }
  };

  // Load amenities list to map IDs to readable English labels
  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const res = await apiClient.get("/amenities", {
          params: { module: type || "house" },
        });
        if (res.data?.data) {
          const map: Record<string, AmenityData> = {};
          res.data.data.forEach((item: AmenityData) => {
            map[item.id] = item;
          });
          setAmenitiesMap(map);
        }
      } catch (err) {
        console.warn("Failed to load review amenities mapping:", err);
      }
    };
    loadAmenities();
  }, [type]);

  const handlePublish = async () => {
    setIsSubmitting(true);
    setSubmitStep(
      isEditMode
        ? "Saving property changes..."
        : "Creating property listing...",
    );

    try {
      const payload = {
        title,
        type,
        transactionType: transactionType,
        district,
        locality,
        address: address || undefined,
        latitude: parseFloat(latitude) || 11.051,
        longitude: parseFloat(longitude) || 76.0711,
        price: Number(price),
        isNegotiable,
        isVerified,
        advanceAmount: advanceAmount ? Number(advanceAmount) : undefined,
        priceUnit,
        description: description || undefined,
        contactPhone,
        alternatePhone: alternatePhone || undefined,
        landDetail: type === "land" ? landDetail : undefined,
        houseDetail: type === "house" ? houseDetail : undefined,
        buildingDetail: type === "building" ? buildingDetail : undefined,
        hotelDetail: type === "hotel" ? hotelDetail : undefined,
        amenityIds,
        mediaSync: undefined as any,
      };

      let propertyId = editingPropertyId;

      if (isEditMode && propertyId) {
        const originalPhotos = (
          (editSnapshot?.photos as
            | Array<{ propertyMediaId?: string }>
            | undefined) ?? []
        )
          .map((item) => item.propertyMediaId)
          .filter(Boolean) as string[];
        const currentPhotos = photos
          .filter((photo) => photo.propertyMediaId)
          .map((photo) => photo.propertyMediaId as string);

        payload.mediaSync = {
          removedPropertyMediaIds: originalPhotos.filter(
            (id) => !currentPhotos.includes(id),
          ),
          coverPropertyMediaId: photos.find((photo) => photo.isCover)
            ?.propertyMediaId,
          sortOrderByPropertyMediaId: Object.fromEntries(
            photos
              .filter((photo) => photo.propertyMediaId)
              .map((photo, index) => [photo.propertyMediaId, index]),
          ),
        };

        await propertiesApi.update(propertyId, payload);
      } else {
        const res = await apiClient.post("/properties", payload);
        propertyId = res.data?.data?.id;
        if (!propertyId) {
          throw new Error("Property creation failed to return a valid ID.");
        }
      }

      const newPhotos = photos.filter((photo) => !photo.propertyMediaId);
      if (newPhotos.length > 0) {
        for (let i = 0; i < newPhotos.length; i++) {
          setSubmitStep(
            isEditMode
              ? `Uploading new photo ${i + 1} of ${newPhotos.length}...`
              : `Uploading photo ${i + 1} of ${newPhotos.length}...`,
          );

          const p = newPhotos[i];
          const compressedUri = await compressImage(p.uri);
          const formData = new FormData();
          const filename = `photo_${Date.now()}_${i}.jpg`;

          formData.append("file", {
            uri: compressedUri,
            name: filename,
            type: "image/jpeg",
          } as any);

          formData.append("isCover", p.isCover ? "true" : "false");
          formData.append(
            "sortOrder",
            photos.findIndex((photo) => photo.uri === p.uri).toString(),
          );

          await uploadClient.post(`/media/property/${propertyId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }

      setSubmitStep("Done!");
      Toast.show({
        type: "success",
        text1: isEditMode ? "Listing Updated!" : "Listing Published!",
        text2: isEditMode
          ? "Your property changes have been saved."
          : "Your property is now active on the feed.",
      });

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feed({}) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featured() });
      queryClient.invalidateQueries({ queryKey: ["properties", "mine"] });
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(propertyId) });
      }

      await resetForm();
      if (isEditMode && propertyId) {
        router.replace(`/property/${propertyId}` as any);
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("Publish error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Check inputs and try again.";
      Alert.alert(isEditMode ? "Save Failed" : "Publish Failed", msg);
    } finally {
      setIsSubmitting(false);
      setSubmitStep("");
    }
  };

  const renderDetailSummary = () => {
    switch (type) {
      case "land":
        return (
          <View style={styles.specGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>{landDetail?.totalArea || "0"}</Text>
              <Text style={styles.specLabel}>
                {landDetail?.areaUnit?.toUpperCase()}
              </Text>
            </View>
          </View>
        );
      case "house":
        return (
          <View style={styles.specGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>{houseDetail?.bedrooms || "0"}</Text>
              <Text style={styles.specLabel}>BEDS</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>
                {houseDetail?.bathrooms || "0"}
              </Text>
              <Text style={styles.specLabel}>BATHS</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>{houseDetail?.floors || "0"}</Text>
              <Text style={styles.specLabel}>FLOORS</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>
                {houseDetail?.furnishingStatus?.replace("_", " ").toUpperCase()}
              </Text>
              <Text style={styles.specLabel}>FURNISHING</Text>
            </View>
          </View>
        );
      case "building":
        return (
          <View style={styles.specGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>
                {buildingDetail?.totalArea || "0"}
              </Text>
              <Text style={styles.specLabel}>
                {buildingDetail?.areaUnit?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>
                {buildingDetail?.subType?.toUpperCase()}
              </Text>
              <Text style={styles.specLabel}>SUBTYPE</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>
                {buildingDetail?.currentStatus?.replace("_", " ").toUpperCase()}
              </Text>
              <Text style={styles.specLabel}>STATUS</Text>
            </View>
          </View>
        );
      case "hotel":
        return (
          <View style={styles.specGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>
                {hotelDetail?.roomType?.toUpperCase()}
              </Text>
              <Text style={styles.specLabel}>ROOM TYPE</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specVal}>{hotelDetail?.occupancy}</Text>
              <Text style={styles.specLabel}>OCCUPANCY</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  if (isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.yellow} />
        <Text style={styles.loadingTitle}>
          {isEditMode ? "Saving Changes..." : "Publishing Listing..."}
        </Text>
        <Text style={styles.loadingSubtitle}>{submitStep}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Review & Submit</Text>
      <Text style={styles.subtitle}>
        Double check all inputs before making this listing active
      </Text>

      {/* Main Review Card */}
      <View style={styles.card}>
        {/* Core Pricing/Title Info */}
        <View style={styles.rowBetween}>
          <Text style={styles.typeBadge}>{type.toUpperCase()}</Text>
          <Text style={styles.txBadge}>{transactionType.toUpperCase()}</Text>
        </View>
        <Text style={styles.cardTitle}>{title || "Untitled Property"}</Text>
        <Text style={styles.cardPrice}>
          ₹{price ? price.toLocaleString() : "0"}{" "}
          <Text style={styles.priceUnit}>/ {priceUnit.replace("_", " ")}</Text>
        </Text>
        {advanceAmount ? (
          <Text style={styles.advanceText}>
            Advance Deposit: ₹{advanceAmount.toLocaleString()}
          </Text>
        ) : null}

        {/* Location Block */}
        <View style={styles.locationBlock}>
          <MaterialCommunityIcons
            name="map-marker"
            size={18}
            color={Colors.yellow}
          />
          <Text style={styles.locationText} numberOfLines={2}>
            {locality}, {district}
          </Text>
        </View>
        {address ? <Text style={styles.addressSub}>{address}</Text> : null}

        {/* Specifications Grid */}
        <Text style={styles.sectionTitle}>Specifications</Text>
        {renderDetailSummary()}

        {/* Selected Amenities List */}
        <Text style={styles.sectionTitle}>Selected Features</Text>
        {amenityIds.length === 0 ? (
          <Text style={styles.emptyText}>No amenities selected.</Text>
        ) : (
          <View style={styles.featuresRow}>
            {amenityIds.map((id) => {
              const item = amenitiesMap[id];
              if (!item) return null;
              return (
                <View key={id} style={styles.featurePill}>
                  <MaterialCommunityIcons
                    name={(item.iconName || "check") as any}
                    size={14}
                    color={Colors.yellow}
                  />
                  <Text style={styles.featurePillText}>{item.nameEn}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Photo Gallery Scroll */}
        <Text style={styles.sectionTitle}>Photos ({photos.length})</Text>
        {photos.length === 0 ? (
          <Text style={styles.emptyText}>No photos uploaded yet.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoGallery}
          >
            {photos.map((item, index) => (
              <View key={index} style={styles.galleryWrapper}>
                <Image source={{ uri: item.uri }} style={styles.galleryImage} />
                {item.isCover && (
                  <View style={styles.galleryCover}>
                    <Text style={styles.galleryCoverText}>COVER</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Description Section */}
        {description ? (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </>
        ) : null}

        {/* Primary Contact details */}
        <Text style={styles.sectionTitle}>Primary Listing Contacts</Text>
        <View style={styles.contactRow}>
          <MaterialCommunityIcons
            name="phone"
            size={16}
            color={Colors.lightMuted}
          />
          <Text style={styles.contactLabel}>Phone: </Text>
          <Text style={styles.contactValue}>{contactPhone}</Text>
        </View>
        {alternatePhone ? (
          <View style={styles.contactRow}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={16}
              color={Colors.lightMuted}
            />
            <Text style={styles.contactLabel}>Alt Phone: </Text>
            <Text style={styles.contactValue}>{alternatePhone}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePublish}
        style={styles.publishBtn}
      >
        <MaterialCommunityIcons
          name="check-decagram"
          size={24}
          color={Colors.dark}
        />
        <Text style={styles.publishText}>
          {isEditMode ? "SAVE CHANGES" : "PUBLISH LISTING"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.lightMuted,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark,
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: Colors.lightMuted,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.white,
    backgroundColor: Colors.dark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  txBadge: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.dark,
    backgroundColor: Colors.yellow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.dark,
    marginBottom: 4,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.lightMuted,
  },
  advanceText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.muted,
    marginBottom: 12,
  },
  locationBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.dark,
    marginLeft: 6,
  },
  addressSub: {
    fontSize: 13,
    color: Colors.lightMuted,
    marginLeft: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.dark,
    marginTop: 20,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specBox: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specVal: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.dark,
  },
  specLabel: {
    fontSize: 10,
    color: Colors.lightMuted,
    fontWeight: "600",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.lightMuted,
    fontStyle: "italic",
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  featurePillText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: "500",
    marginLeft: 6,
  },
  photoGallery: {
    flexDirection: "row",
    marginTop: 4,
  },
  galleryWrapper: {
    position: "relative",
    marginRight: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  galleryImage: {
    width: 100,
    height: 80,
    backgroundColor: Colors.surface,
  },
  galleryCover: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.yellow,
    paddingVertical: 2,
    alignItems: "center",
  },
  galleryCoverText: {
    fontSize: 8,
    fontWeight: "900",
    color: Colors.dark,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  contactLabel: {
    fontSize: 14,
    color: Colors.lightMuted,
    marginLeft: 8,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
  },
  publishBtn: {
    flexDirection: "row",
    backgroundColor: Colors.yellow,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  publishText: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.dark,
    marginLeft: 8,
  },
});
