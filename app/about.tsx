import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@constants/colors";
import appJson from "../app.json";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

export default function AboutScreen() {
  const { t } = useTranslation();
  const version = appJson.expo.version;

  const features: Feature[] = [
    {
      icon: "sparkles-outline",
      title: t("about.feature_ai"),
      description: t("about.feature_ai_desc"),
    },
    {
      icon: "search-outline",
      title: t("about.feature_search"),
      description: t("about.feature_search_desc"),
    },
    {
      icon: "location-outline",
      title: t("about.feature_location"),
      description: t("about.feature_location_desc"),
    },
    {
      icon: "heart-outline",
      title: t("about.feature_save"),
      description: t("about.feature_save_desc"),
    },
    {
      icon: "chatbox-outline",
      title: t("about.feature_contact"),
      description: t("about.feature_contact_desc"),
    },
  ];

  const openInstagram = async () => {
    try {
      await Linking.openURL("https://instagram.com/homiholdings");
    } catch {
      Alert.alert(t("common.error_generic"), t("help.instagram_error"));
    }
  };

  const openEmail = async () => {
    try {
      await Linking.openURL("mailto:info@homiholdings.com");
    } catch {
      Alert.alert(t("common.error_generic"));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile.about")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
  <Image
    source={require('../assets/logo-transparent.png')} // adjust path
    style={{
      width: 98,
      height: 98,
      resizeMode: 'contain',
    }}
  />
  </View>
          <Text style={styles.appName}>HOMI HOLDINGS</Text>
          <Text style={styles.tagline}>{t("about.tagline")}</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.about_title")}</Text>
          <Text style={styles.aboutText}>{t("about.about_description")}</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.mission_title")}</Text>
          <Text style={styles.aboutText}>{t("about.mission_description")}</Text>
        </View>

        {/* Vision Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.vision_title")}</Text>
          <Text style={styles.aboutText}>{t("about.vision_description")}</Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.features_title")}</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color={Colors.dark}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Social Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("about.connect_title")}</Text>
          <TouchableOpacity style={styles.socialRow} onPress={openInstagram}>
            <Ionicons name="logo-instagram" size={24} color={Colors.dark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.socialName}>Instagram</Text>
              <Text style={styles.socialHandle}>@homiholdings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialRow, styles.socialRowBorder]}
            onPress={openEmail}
          >
            <Ionicons name="mail-outline" size={24} color={Colors.dark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.socialName}>{t("about.email")}</Text>
              <Text style={styles.socialHandle}>info@homiholdings.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>
            {t("about.version")} v{version}
          </Text>
          <Text style={styles.versionSubtext}>{t("about.copyright")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 32,
  },

  // Hero Section
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
    fontWeight: "500",
  },

  // Section Styles
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
    textAlign: "justify",
  },

  // Feature Styles
  featureCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.softYellow,
    justifyContent: "center",
    alignItems: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 18,
  },

  // Social Styles
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialRowBorder: {
    marginBottom: 0,
  },
  socialName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.dark,
  },
  socialHandle: {
    fontSize: 13,
    color: Colors.muted,
    marginTop: 2,
  },

  // Version Section
  versionSection: {
    alignItems: "center",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  versionText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark,
  },
  versionSubtext: {
    fontSize: 12,
    color: Colors.lightMuted,
    marginTop: 4,
  },
});
