import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useFilterStore } from "@store/filter.store";
import { isDistrictSupported } from "@constants/locations";
import { useAppStore } from "@/store/app.store";

export function useLocation() {
  const { t } = useTranslation();
  const setFilter = useFilterStore((state) => state.setFilter);
  const setAppLocation = useAppStore((state) => state.setLocation);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    district: string | undefined;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setLocation({ latitude: 0, longitude: 0, district: undefined });
          setFilter({ district: undefined });
          setLoading(false);
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({});

        console.log("userCurrentPosition", currentPosition);

        // Reverse geocoding to find district
        const geocode = await Location.reverseGeocodeAsync({
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        });

        console.log("userGeocodeLocation", geocode);

        const foundDistrict =
          geocode[0]?.subregion || geocode[0]?.city || undefined;

        console.log("foundDistrict", foundDistrict);

        // Auto-select logic
        let autoSelectedDistrict = undefined;
        if (foundDistrict && isDistrictSupported(foundDistrict)) {
          autoSelectedDistrict = foundDistrict;
        }

        setLocation({
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
          district: autoSelectedDistrict,
        });
        // set location to global store
        setAppLocation(
          currentPosition.coords.latitude,
          currentPosition.coords.longitude,
          autoSelectedDistrict,
        );

        console.log("final userLocation", location);

        // Sync with global filter store
        setFilter({ district: autoSelectedDistrict });
      } catch (error) {
        console.warn("Error fetching location:", error);
        setErrorMsg("Could not fetch location");
        setLocation({ latitude: 0, longitude: 0, district: undefined });
        setFilter({ district: undefined });

        Toast.show({
          type: "error",
          text1: t("location.error", "Could not fetch location"),
          text2: t("location.fallback", "Viewing all locations."),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [t, setFilter]);

  return { location, loading, errorMsg };
}
