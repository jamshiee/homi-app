import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@constants/colors";
import { usePostStore } from "@store/postStore";

export default function PostSuccessScreen() {
  const { t } = useTranslation();
  const { resetForm } = usePostStore();

  const handleViewListings = async () => {
    await resetForm();
    router.replace("/my-listings" as any);
  };

  const handleGoHome = async () => {
    await resetForm();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconWrap}>
       <MaterialCommunityIcons
  name="check-decagram"
  size={72}
  color={Colors.success}
/>
        </View>

        {/* Text */}
        <Text style={styles.title}>{t("post.successfully_posted_title")}</Text>
        <Text style={styles.body}>{t("post.successfully_posted_body")}</Text>

        {/* CTAs */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleViewListings}>
          <Text style={styles.primaryBtnText}>{t("post.under_review_cta")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoHome}>
          <Text style={styles.secondaryBtnText}>{t("post.under_review_home")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
backgroundColor: Colors.success + "15",    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.dark,
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 32,
  },
  body: {
    fontSize: 15,
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
  },
  primaryBtn: {
    backgroundColor: Colors.dark,
    paddingVertical: 16,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
  },
  secondaryBtnText: {
    color: Colors.lightMuted,
    fontSize: 14,
    fontWeight: "500",
  },
});
