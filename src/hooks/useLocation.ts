import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useFilterStore } from "@store/filter.store";
import { isDistrictSupported } from "@constants/locations";
import { useAppStore } from "@/store/app.store";
import { apiClient } from "@/api/client";

export function useLocation() {
  const { t } = useTranslation();
  const setFilter = useFilterStore((state) => state.setFilter);
  const setAppLocation = useAppStore((state) => state.setLocation);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    district: string | undefined;
    locality: string | undefined;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLocation({ latitude: 0, longitude: 0, district: undefined, locality: undefined });
        setFilter({ district: undefined, locality: undefined });
        return;
      }

      const currentPosition = await Location.getCurrentPositionAsync({});
      console.log("userCurrentPosition", currentPosition);

      // Reverse geocoding via backend (supports Nominatim or Mapbox per env config)
      const res = await apiClient.get("/geocoding/reverse", {
        params: {
          lat: currentPosition.coords.latitude,
          lon: currentPosition.coords.longitude,
        },
      });

      const geocodeData = res?.data?.data;
      console.log("userGeocodeLocation", geocodeData);

      const foundDistrict: string | undefined = geocodeData?.district;
      const foundLocality: string | undefined = geocodeData?.locality;

      console.log("foundDistrict", foundDistrict, "foundLocality", foundLocality);

      // Only auto-select district if it's one we support
      const autoSelectedDistrict =
        foundDistrict && isDistrictSupported(foundDistrict)
          ? foundDistrict
          : undefined;

      setLocation({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        district: autoSelectedDistrict,
        locality: foundLocality,
      });

      // Persist to global app store (lat/lon + labels for UI display)
      setAppLocation(
        currentPosition.coords.latitude,
        currentPosition.coords.longitude,
        autoSelectedDistrict,
        foundLocality,
      );

      // Sync with filter store so the feed refreshes automatically
      setFilter({ district: autoSelectedDistrict, locality: foundLocality });
    } catch (error) {
      console.warn("Error fetching location:", error);
      setErrorMsg("Could not fetch location");
      setLocation({ latitude: 0, longitude: 0, district: undefined, locality: undefined });
      setFilter({ district: undefined, locality: undefined });

      Toast.show({
        type: "error",
        text1: t("location.error", "Could not fetch location"),
        text2: t("location.fallback", "Viewing all locations."),
      });
    } finally {
      setLoading(false);
    }
  }, [t, setFilter, setAppLocation]);

  // Auto-fetch on mount — existing callers (index.tsx etc.) are unaffected
  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, loading, errorMsg, refetch: fetchLocation };
}
