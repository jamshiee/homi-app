import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useMyListings, useDeleteProperty } from "@hooks/useProperties";
import { PropertyCard } from "@components/PropertyCard";
import { Colors } from "@constants/colors";
import { PropertyDto } from "@api/types";

export default function MyListingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isLoading } = useMyListings({});

  const properties =
    data?.pages.flatMap((p) => p.data.data as PropertyDto[]) ?? [];

  const navToProperty = (id: string) => router.push(`/property/${id}`);
  const navToEdit = (id: string) => router.push(`/property/${id}/edit`);

  const deleteMutation = useDeleteProperty();

  const confirmDelete = (id: string) => {
    Alert.alert(
      t("common.confirm"),
      t("profile.confirm_delete_listing", "Delete this listing?"),
      [
        { text: t("common.cancel", "Cancel"), style: "cancel" },
        {
          text: t("common.delete", "Delete"),
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      edges={["top"]}
    >
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.dark }}>
          {t("profile.my_listings")}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.yellow}
            style={{ marginTop: 24 }}
          />
        ) : properties.length > 0 ? (
          properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              onPress={navToProperty}
              showActions
              onEdit={navToEdit}
              onDelete={confirmDelete}
              onWhatsAppPress={() => null}
              onCallPress={() => null}
              onViewNumberPress={() => null}
            />
          ))
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: 40,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: Colors.dark,
                marginTop: 12,
              }}
            >
              {t("profile.empty_my_listings", "No listings yet")}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
