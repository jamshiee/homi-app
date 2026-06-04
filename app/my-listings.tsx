import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useMyListings, useDeleteProperty } from "@hooks/useProperties";
import { PropertyCard } from "@components/PropertyCard";
import { Colors } from "@constants/colors";
import { PropertyDto } from "@api/types";
import { Ionicons } from "@expo/vector-icons";
import { ConfirmModal } from "@components/ConfirmModal";

export default function MyListingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isLoading } = useMyListings({});

  const properties =
    data?.pages.flatMap((p) => p.data.data as PropertyDto[]) ?? [];

  const navToProperty = (id: string) => router.push(`/property/${id}`);
  const navToEdit = (id: string) => router.push(`/property/${id}/edit`);

  const deleteMutation = useDeleteProperty();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    setPropertyToDelete(id);
    setDeleteModalVisible(true);
  };

  const executeDelete = () => {
    if (propertyToDelete) {
      deleteMutation.mutate(propertyToDelete);
    }
    setDeleteModalVisible(false);
    setPropertyToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setPropertyToDelete(null);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.white }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.my_listings")}</Text>
        <View style={{ width: 40 }} />
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
      <ConfirmModal
        visible={deleteModalVisible}
        title={t("common.confirm", "Confirm")}
        message={t("profile.confirm_delete_listing", "Delete this listing?")}
        confirmText={t("common.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
        onConfirm={executeDelete}
        onCancel={cancelDelete}
        isDestructive={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    flex: 1,
    textAlign: "center",
  },
});
