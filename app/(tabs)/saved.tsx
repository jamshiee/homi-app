import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@constants/colors";
import { useSavedProperties, useToggleSave } from "@hooks/useProperties";
import { useAuthStore } from "@store/auth.store";
import { PropertyCard } from "@components/PropertyCard";
import { PropertyDto } from "@api/types";
import { propertiesApi } from "@api/properties.api";
import { openWhatsApp, openPhone } from "@utils/contact";

export default function SavedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading, refetch, isRefetching } = useSavedProperties();
  const toggleSave = useToggleSave();

  const savedProperties = (data?.data?.data as PropertyDto[]) ?? [];

  const handleWhatsApp = async (property: PropertyDto) => {
    await propertiesApi.logEnquiry(property.id, "whatsapp").catch(() => null);
    openWhatsApp(property.contactPhone, property.title ?? property.type);
  };

  const handleCall = async (property: PropertyDto) => {
    await propertiesApi
      .logEnquiry(property.id, "phone_reveal")
      .catch(() => null);
    openPhone(property.contactPhone);
  };

  // Redirect to auth if not logged in
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Ionicons name="heart-outline" size={56} color={Colors.lightMuted} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.dark,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {t("saved.login_required", "Sign in to view saved properties")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.muted,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {t(
              "saved.login_sub",
              "Save properties you love and access them anytime",
            )}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/phone")}
            style={{
              marginTop: 24,
              backgroundColor: Colors.yellow,
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 30,
            }}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 15, color: Colors.dark }}
            >
              {t("auth.sign_in", "Sign In")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color={Colors.yellow} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      edges={["top"]}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: Colors.dark }}>
          {t("saved.title", "Saved Properties")}
        </Text>
        {savedProperties.length > 0 && (
          <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 4 }}>
            {t("saved.count", "{{count}} saved", {
              count: savedProperties.length,
            })}
          </Text>
        )}
      </View>

      {savedProperties.length === 0 ? (
        /* Empty state */
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Ionicons name="heart-outline" size={56} color={Colors.lightMuted} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: Colors.dark,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {t("saved.empty_title", "Nothing saved yet")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.muted,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {t("saved.empty_sub", "Browse properties and tap ♡ to save")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            style={{
              marginTop: 24,
              backgroundColor: Colors.yellow,
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 30,
            }}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 15, color: Colors.dark }}
            >
              {t("saved.browse", "Browse")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedProperties}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={(id) => router.push(`/property/${id}`)}
              onSaveToggle={(id) => toggleSave.mutate(id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
