import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import { Colors } from "@constants/colors";
import { useAuthStore } from "@store/auth.store";
import { usePostStore } from "@store/postStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { propertiesApi } from "@api/properties.api";

import Step1Type from "@components/post/Step1Type";
import Step2Location from "@components/post/Step2Location";
import Step3Details from "@components/post/Step3Details";
import Step4Pricing from "@components/post/Step4Pricing";
import Step5Amenities from "@components/post/Step5Amenities";
import Step6Photos from "@components/post/Step6Photos";
import Step7Review from "@components/post/Step7Review";

interface PostScreenProps {
  mode?: "create" | "edit";
  propertyId?: string;
}

export function PostScreen({ mode = "create", propertyId }: PostScreenProps) {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const isAdmin = user?.isAdmin ?? false;
  const [isHydrating, setIsHydrating] = useState(mode === "edit");

  const {
    step,
    type,
    district,
    locality,
    landDetail,
    houseDetail,
    buildingDetail,
    hotelDetail,
    title,
    transactionType,
    price,
    photos,
    scrollEnabled,
    isEditMode,
    isDirty,
    nextStep,
    prevStep,
    loadDraft,
    resetForm,
    hydrateForEdit,
  } = usePostStore();

  usePreventRemove(mode === "edit" && isDirty, ({ data }) => {
    Alert.alert("Unsaved changes", "Leave this page without saving?", [
      { text: "Stay", style: "cancel" },
      {
        text: "Discard changes",
        style: "destructive",
        onPress: () => {
          navigation.dispatch(data.action);
        },
      },
    ]);
  });

  useEffect(() => {
    if (mode === "create" && isAdmin) {
      void loadDraft();
    }
  }, [isAdmin, loadDraft, mode]);

  useEffect(() => {
    if (mode !== "edit" || !propertyId) {
      setIsHydrating(false);
      return;
    }

    let isMounted = true;
    const hydrate = async () => {
      try {
        const res = await propertiesApi.getById(propertyId);
        if (!isMounted) return;
        hydrateForEdit(res.data?.data);
        if (step === 1) nextStep(); // If property type is already set, skip to step 2
      } catch (error) {
        console.warn("Failed to load property for edit mode", error);
        Alert.alert("Unable to load property", "Please try again later.");
      } finally {
        if (isMounted) setIsHydrating(false);
      }
    };

    void hydrate();
    return () => {
      isMounted = false;
    };
  }, [hydrateForEdit, mode, propertyId]);

  if (mode === "create" && !isAdmin) {
    return (
      <SafeAreaView style={styles.guardContainer}>
        <View style={styles.guardCard}>
          <View style={styles.errorIcon}>
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={60}
              color={Colors.error}
            />
          </View>
          <Text style={styles.guardTitle}>Admin Access Required</Text>
          <Text style={styles.guardSubtitle}>
            Only authorized administrator and lister accounts can create and
            publish listings on Homi.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (mode === "edit" && isHydrating) {
    return (
      <SafeAreaView style={styles.guardContainer}>
        <View style={styles.guardCard}>
          <ActivityIndicator size="large" color={Colors.yellow} />
          <Text style={styles.guardTitle}>Loading listing</Text>
          <Text style={styles.guardSubtitle}>
            Preparing your existing property details for editing.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1Type />;
      case 2:
        return <Step2Location />;
      case 3:
        return <Step3Details />;
      case 4:
        return <Step4Pricing />;
      case 5:
        return <Step5Amenities />;
      case 6:
        return <Step6Photos />;
      case 7:
        return <Step7Review />;
      default:
        return <Step1Type />;
    }
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !type;
      case 2:
        return !district || !locality;
      case 3:
        if (type === "land") return !landDetail?.totalArea;
        if (type === "house") return !houseDetail?.furnishingStatus;
        if (type === "building")
          return !buildingDetail?.totalArea || !buildingDetail?.subType;
        if (type === "hotel")
          return !hotelDetail?.subType || !hotelDetail?.roomType;
        return true;
      case 4:
        return !title || !transactionType || !price;
      case 6:
        return photos.length === 0;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {mode === "edit" ? "Edit Listing" : "Create Listing"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {mode === "edit"
              ? "Update the property details and media"
              : "Publish property to the Homi feed"}
          </Text>
        </View>
        {mode === "create" && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => void resetForm()}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={Colors.lightMuted}
            />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${(step / 7) * 100}%` }]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>Step {step} of 7</Text>
          <Text style={styles.progressPercent}>
            {Math.round((step / 7) * 100)}% Complete
          </Text>
        </View>
      </View>

      <ScrollView
        scrollEnabled={scrollEnabled !== false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      {step < 7 && (
        <View style={styles.footer}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              isNextDisabled() && styles.nextButtonDisabled,
            ]}
            disabled={isNextDisabled()}
            onPress={nextStep}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={16}
              color={Colors.dark}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function PostScreenRoute() {
  return <PostScreen mode="create" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  guardContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  guardCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  errorIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.error + "10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  guardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 10,
    textAlign: "center",
  },
  guardSubtitle: {
    fontSize: 14,
    color: Colors.lightMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.lightMuted,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetText: {
    fontSize: 13,
    color: Colors.lightMuted,
    fontWeight: "600",
    marginLeft: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.yellow,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.yellow,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.lightMuted,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.yellow,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.dark,
    marginRight: 6,
  },
});
