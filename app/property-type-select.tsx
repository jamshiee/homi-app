import { useAppStore } from "@/store/app.store";
import { Colors } from "@constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFilterStore } from "@store/filter.store";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PropertyTypeSelectScreen() {
  const { t } = useTranslation();
  const { setFilter } = useFilterStore();
  const { language, setLanguage } = useAppStore();
  

  const handleSelectHotel = () => {
    setFilter({ type: ["hotel"] });
    router.replace("/(tabs)");
  };

  const handleSelectOthers = () => {
    setFilter({ type: ["house", "land", "building"] });
    router.replace("/(tabs)");
  };

  const handleSelectAll = () => {
    setFilter({ type: [] });
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.yellow }}>

  <View
        style={{
          position: 'absolute',
          top: 60,
          right: 24,
          zIndex: 10,
          flexDirection: 'row',
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: 20,
          padding: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => setLanguage('en')}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: language === 'en' ? Colors.white : 'transparent',
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: language === 'en' ? Colors.dark : Colors.muted,
            }}
          >
            EN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage('ml')}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: language === 'ml' ? Colors.white : 'transparent',
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: language === 'ml' ? Colors.dark : Colors.muted,
            }}
          >
            മല
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}
      >
        <View style={{ marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 42,
              color: Colors.dark,
              textAlign: "left",
              marginBottom: 12,
              fontWeight: "600",
              lineHeight: 48,
            }}
          >
            {t(
              "welcome.what_are_you_looking_for",
              "What are you\nlooking for?",
            )}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: Colors.muted,
              textAlign: "left",
              lineHeight: 24,
            }}
          >
            {t(
              "welcome.select_property_type",
              "Choose a category to find the best properties that match your needs.",
            )}
          </Text>
        </View>

        {/* Primary Option: Real Estate */}
        <TouchableOpacity
          style={styles.primaryCard}
          onPress={handleSelectOthers}
          activeOpacity={0.85}
        >
          <View style={styles.iconContainerPrimary}>
            <Ionicons name="home" size={28} color={Colors.dark} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.primaryTitle}>
              {t("welcome.house_land_buildings", "House, Land & Buildings")}
            </Text>
            <Text style={styles.primarySubtitle}>
              {t(
                "welcome.real_estate_subtitle",
                "Buy, sell, or rent residential and commercial properties.",
              )}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors.yellow}
            style={{ opacity: 0.8 }}
          />
        </TouchableOpacity>

        {/* Secondary Option: Hotels & Resorts */}
        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={handleSelectHotel}
          activeOpacity={0.85}
        >
          <View style={styles.iconContainerSecondary}>
            <Ionicons name="bed" size={26} color={Colors.white} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.secondaryTitle}>
              {t("welcome.hotels_resorts", "Hotels & Resorts")}
            </Text>
            <Text style={styles.secondarySubtitle}>
              {t(
                "welcome.hotels_subtitle",
                "Find stays, lodges, and luxury resorts for your next trip.",
              )}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors.muted}
            style={{ opacity: 0.5 }}
          />
        </TouchableOpacity>

        {/* Tertiary Option: All Properties */}
        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={handleSelectAll}
          activeOpacity={0.8}
        >
          <Text style={styles.tertiaryText}>
            {t("welcome.browse_all", "Browse all properties instead")}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={Colors.muted}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  primaryCard: {
    backgroundColor: Colors.dark,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.05)",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainerPrimary: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconContainerSecondary: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    paddingRight: 8,
  },
  primaryTitle: {
    color: Colors.yellow,
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 4,
  },
  primarySubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    lineHeight: 18,
  },
  secondaryTitle: {
    color: Colors.dark,
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 4,
  },
  secondarySubtitle: {
    color: Colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  tertiaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  tertiaryText: {
    color: Colors.muted,
    fontSize: 15,
    fontWeight: "600",
  },
});
