import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    Alert.alert(t("post.unsaved_changes"), t("post.leave_without_saving"), [
      { text: t("post.stay"), style: "cancel" },
      {
        text: t("post.discard_changes"),
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
        Alert.alert(t("post.unable_to_load"), t("post.try_again_later"));
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
    // Non-admin users can still create — no guard needed
    // (left intentionally blank — falls through to the form below)
  }

  if (mode === "edit" && isHydrating) {
    return (
      <SafeAreaView style={styles.guardContainer}>
        <View style={styles.guardCard}>
          <ActivityIndicator size="large" color={Colors.yellow} />
          <Text style={styles.guardTitle}>{t("post.loading_listing")}</Text>
          <Text style={styles.guardSubtitle}>
            {t("post.loading_listing_sub")}
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
          return !hotelDetail?.subType || !hotelDetail?.roomType || !hotelDetail?.hotelCategory;
        return true;
      case 4:
        return !title || !transactionType || !price;
      case 6:
        return photos.length === 0;
      default:
        return false;
    }
  };

  const handleExit = () => {
    if (mode === "edit") {
      navigation.goBack();
    } else {
      router.navigate("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Modal-style top bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <MaterialCommunityIcons name="close" size={22} color={Colors.dark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {mode === "edit" ? t("post.edit_listing") : t("post.create_listing")}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t("post.step_of", { step })}
          </Text>
        </View>

        {mode === "create" ? (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => void resetForm()}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={18}
              color={Colors.lightMuted}
            />
            <Text style={styles.resetText}>{t("post.reset")}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resetButton} />
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${(step / 7) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressPercent}>
          {t("post.percent_complete", { percent: Math.round((step / 7) * 100) })}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={84}
      >
        <ScrollView
          scrollEnabled={scrollEnabled !== false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>
      </KeyboardAvoidingView>

      {step < 7 && (
        <View style={styles.footer}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Text style={styles.backButtonText}>{t("post.back")}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              isNextDisabled() && styles.nextButtonDisabled,
            ]}
            disabled={isNextDisabled()}
            onPress={nextStep}
          >
            <Text style={styles.nextButtonText}>{t("post.next")}</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.dark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.lightMuted,
    marginTop: 1,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    width: 72,
    justifyContent: "flex-end",
    paddingRight: 4,
  },
  resetText: {
    fontSize: 13,
    color: Colors.lightMuted,
    fontWeight: "600",
    marginLeft: 3,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.yellow,
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.yellow,
    textAlign: "right",
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
  backButtonPlaceholder: {
    width: 90,
  },
  backButton: {
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.yellow,
    paddingHorizontal: 28,
    borderRadius: 30,
    height: 56,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    marginRight: 6,
  },
});
