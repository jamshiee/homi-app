import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import { usePostStore } from "../../store/postStore";
import { Colors } from "../../constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { apiClient } from "../../api/client";
import { useAppStore } from "@/store/app.store";
import { useTranslation } from "react-i18next";

interface GeocodeSuggestion {
  displayAddress: string;
  latitude: number;
  longitude: number;
  district?: string;
  locality?: string;
}

export default function Step2Location() {
  const { district, locality, address, latitude, longitude, setField } =
    usePostStore();
  const { t } = useTranslation();

  const { latitude: appLatitude, longitude: appLongitude } = useAppStore(
    (state) => state
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const hasInitialisedFromGps = useRef(false);
  const mapRef = useRef<MapView | null>(null);

  const parsedLat = parseFloat(latitude) || appLatitude || 11.051;
  const parsedLon = parseFloat(longitude) || appLongitude || 76.0711;

  useEffect(() => {
    if (!appLatitude || !appLongitude) return;
    if (hasInitialisedFromGps.current) return;
    if (latitude && longitude) return;

    hasInitialisedFromGps.current = true;

    const init = async () => {
      setIsResolving(true);
      setField({
        latitude: appLatitude.toString(),
        longitude: appLongitude.toString(),
      });

      try {
        const res = await apiClient.get("/geocoding/reverse", {
          params: { lat: appLatitude, lon: appLongitude },
        });
        if (res.data?.data) {
          console.log("homi backend reverse geocode response",JSON.stringify(res.data.data,null,2))
          const { locality: revLoc, district: revDist, displayAddress: revFull } =
            res.data.data;
          setField({
            locality: revLoc || "",
            district: revDist || "",
            address: revFull || "",
          });
        }
      } catch (err) {
        console.warn("GPS reverse geocoding failed:", err);
      } finally {
        setIsResolving(false);
      }
    };

    void init();
  }, [appLatitude, appLongitude]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get("/geocoding/search", {
          params: { query: searchQuery },
        });
        if (res.data?.data) {
          setSuggestions(res.data.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn("Autocomplete search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (item: GeocodeSuggestion) => {
    setField({
      locality: item.locality || item.displayAddress.split(",")[0],
      district: item.district || district,
      latitude: item.latitude.toString(),
      longitude: item.longitude.toString(),
      address: item.displayAddress,
    });
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);

    mapRef.current?.animateToRegion(
      {
        latitude: item.latitude,
        longitude: item.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      800
    );
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude: clickLat, longitude: clickLon } = e.nativeEvent.coordinate;

    setField({ latitude: clickLat.toString(), longitude: clickLon.toString() });
    setIsResolving(true);

    try {
      const res = await apiClient.get("/geocoding/reverse", {
        params: { lat: clickLat, lon: clickLon },
      });
      if (res.data?.data) {
        const { locality: revLoc, district: revDist, displayAddress: revFull } =
          res.data.data;
        setField({
          locality: revLoc || locality,
          district: revDist || district,
          address: revFull || address,
        });
      }
    } catch (err) {
      console.warn("Reverse geocoding failed:", err);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("post.step2_title")}</Text>
      <Text style={styles.subtitle}>{t("post.step2_subtitle")}</Text>

      {/* ── Search locality ────────────────────────────────────────────── */}
      <Text style={styles.label}>{t("post.step2_search_label")}</Text>
      <View style={styles.searchWrapper}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={Colors.lightMuted}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder={t("post.step2_search_placeholder")}
            placeholderTextColor={Colors.lightMuted}
            value={searchQuery || locality}
            onChangeText={(v) => {
              setSearchQuery(v);
              if (locality && v !== locality) setField({ locality: "" });
            }}
            style={styles.searchInput}
          />
          {isSearching && (
            <ActivityIndicator size="small" color={Colors.yellow} style={styles.spinner} />
          )}
        </View>

        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsCard}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => handleSelectSuggestion(item)}
                style={[
                  styles.suggestionRow,
                  index < suggestions.length - 1 && styles.suggestionBorder,
                ]}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={18}
                  color={Colors.yellow}
                />
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {item.displayAddress}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── Resolved location badges ─────────────────────────────────────── */}
      {(locality || district || isResolving) && (
        <View style={styles.badgeRow}>
          {isResolving ? (
            <View style={styles.resolvingBadge}>
              <ActivityIndicator size="small" color={Colors.yellow} />
              <Text style={styles.resolvingText}>{t("post.step2_detecting")}</Text>
            </View>
          ) : (
            <>
              {locality ? (
                <View style={styles.badge}>
                  <MaterialCommunityIcons name="home-city-outline" size={14} color={Colors.yellow} />
                  <Text style={styles.badgeText}>{locality}</Text>
                </View>
              ) : null}
              {district ? (
                <View style={[styles.badge, styles.badgeDistrict]}>
                  <MaterialCommunityIcons name="map-outline" size={14} color={Colors.dark} />
                  <Text style={[styles.badgeText, { color: Colors.dark }]}>{district}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      )}

      {/* ── Optional address text area ───────────────────────────────────── */}
      <Text style={styles.label}>{t("post.step2_address_label")}</Text>
      <TextInput
        placeholder={t("post.step2_address_placeholder")}
        placeholderTextColor={Colors.lightMuted}
        multiline
        numberOfLines={3}
        value={address}
        onChangeText={(v) => setField({ address: v })}
        style={styles.textArea}
      />

      {/* ── Map pin widget ───────────────────────────────────────────────── */}
      <View style={styles.mapLabelContainer}>
        <Text style={styles.label}>{t("post.step2_map_label")}</Text>
        <Text style={styles.mapHint}>{t("post.step2_map_hint")}</Text>
      </View>
      <View style={styles.mapCard}>
        <MapView
          ref={mapRef}
          onPress={handleMapPress}
          initialRegion={{
            latitude: parsedLat,
            longitude: parsedLon,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          style={styles.map}
        >
          <Marker
            coordinate={{ latitude: parsedLat, longitude: parsedLon }}
            title={locality || "Property Location"}
            description={district || ""}
            pinColor={Colors.yellow}
          />
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.lightMuted,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 8,
    marginTop: 16,
  },
  searchWrapper: { position: "relative", zIndex: 10 },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark,
    paddingVertical: 12,
  },
  spinner: { marginLeft: 8 },
  suggestionsCard: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 220,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionText: { fontSize: 14, color: Colors.dark, marginLeft: 8, flex: 1 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.yellow + "22",
    borderWidth: 1,
    borderColor: Colors.yellow,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeDistrict: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.yellow,
  },
  resolvingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resolvingText: {
    fontSize: 13,
    color: Colors.lightMuted,
  },
  textArea: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.dark,
    textAlignVertical: "top",
    height: 90,
  },
  mapLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  mapHint: { fontSize: 11, color: Colors.lightMuted },
  mapCard: {
    height: 240,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  map: { ...StyleSheet.absoluteFillObject },
});
