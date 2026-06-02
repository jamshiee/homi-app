import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { useAuthStore } from "@store/auth.store";
import { useAppStore } from "@store/app.store";
import { apiClient } from "@api/client";
import Toast from "react-native-toast-message";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { uploadClient } from "@api/client";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout, updateUser } = useAuthStore();
  const { language, setLanguage } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
    }
  }, [user]);

  const initials = useMemo(() => {
    const label = user?.name?.trim() || user?.phone || "U";
    return label
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert(t("profile.name_required"));
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.patch("/users/me", {
        name: name.trim(),
      });
      updateUser({ name: name.trim() });
      setIsEditing(false);
      Toast.show({
        type: "success",
        text1: t("profile.saved_title"),
        text2: t("profile.saved_body"),
      });
    } catch (err: any) {
      console.error("Profile save error:", err);
      Alert.alert(
        t("common.error_generic"),
        err.response?.data?.message || t("common.error_generic"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t("common.permission_denied"));
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (res.canceled) return;
      setIsUploading(true);
      const uri = res.assets?.[0]?.uri ?? (res as any).uri;
      const filename = uri.split("/").pop() ?? "photo.jpg";
      const match = /\.([0-9a-z]+)(?:[?#]|$)/i.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      const formData = new FormData();
      // @ts-ignore
      formData.append("file", {
        uri,
        name: filename,
        type,
      });
      const { data } = await uploadClient.post("/media/user", formData as any);
      const media = data.data;
      updateUser({ profileMediaId: media.id, profileMediaUrl: media.url });
      Toast.show({ type: "success", text1: t("profile.photo_uploaded") });
    } catch (e: any) {
      console.error("Upload error", e);
      Alert.alert(
        t("common.error_generic"),
        e?.response?.data?.message || e.message,
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.yellow} />
          <Text style={styles.emptyText}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar - only editable in edit mode */}
          <View style={styles.avatarContainer}>
            {user.profileMediaUrl ? (
              <Image
                source={{ uri: user.profileMediaUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            {isEditing && (
              <TouchableOpacity
                style={styles.uploadIconButton}
                onPress={handleUploadPhoto}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="camera" size={16} color={Colors.white} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Name & Phone */}
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{user.name || user.phone}</Text>
            <Text style={styles.phoneText}>{user.phone}</Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={[styles.editButton, isEditing && styles.editButtonActive]}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons
              name={isEditing ? "close" : "pencil"}
              size={18}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Edit Name Section */}
        {isEditing && (
          <View style={styles.editSection}>
            <Text style={styles.sectionLabel}>{t("profile.name_label")}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("profile.name_label")}
              placeholderTextColor={Colors.lightMuted}
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setName(user.name ?? "");
                }}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>{t("common.save")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="globe-outline" size={20} color={Colors.muted} />
              <Text style={styles.sectionTitle}>{t("profile.language")}</Text>
            </View>
            <View style={styles.languagePill}>
              <TouchableOpacity
                onPress={() => {
                  setLanguage("en");
                  updateUser({ preferredLanguage: "en" });
                }}
                style={[
                  styles.pillButton,
                  user.preferredLanguage === "en" && styles.pillButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    user.preferredLanguage === "en" && styles.pillTextActive,
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setLanguage("ml");
                  updateUser({ preferredLanguage: "ml" });
                }}
                style={[
                  styles.pillButton,
                  user.preferredLanguage === "ml" && styles.pillButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    user.preferredLanguage === "ml" && styles.pillTextActive,
                  ]}
                >
                  മല
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          {user.isAdmin && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push("/my-listings")}
            >
              <Ionicons name="home-outline" size={20} color={Colors.dark} />
              <Text style={styles.actionText}>{t("profile.my_listings")}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/help-support")}
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={Colors.dark}
            />
            <Text style={styles.actionText}>{t("profile.help_support")}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push("/about")}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.dark}
            />
            <Text style={styles.actionText}>{t("profile.about")}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button - At Bottom of Scroll */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(t("profile.logout"), t("profile.logout_confirm"), [
              { text: t("common.cancel"), onPress: () => {}, style: "cancel" },
              {
                text: t("profile.logout"),
                onPress: () => logout(),
                style: "destructive",
              },
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutButtonText}>{t("profile.logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    color: Colors.lightMuted,
    fontSize: 14,
  },

  // Profile Card Styles
  profileCard: {
    backgroundColor: Colors.yellow,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  uploadIconButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.yellow,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
  },
  phoneText: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.muted,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "700",
  },
  editButton: {
    backgroundColor: Colors.dark,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonActive: {
    backgroundColor: Colors.error,
  },

  // Edit Section Styles
  editSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.lightMuted,
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.dark,
    fontWeight: "700",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: Colors.dark,
  },
  saveButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 15,
  },

  // Section Styles
  section: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  languagePill: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 4,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pillButtonActive: {
    backgroundColor: Colors.dark,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.muted,
  },
  pillTextActive: {
    color: Colors.white,
  },

  // Action Row Styles
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark,
    fontWeight: "500",
  },

  // Logout Styles
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 24,
  },
  logoutButtonText: {
    color: Colors.error,
    fontWeight: "700",
    fontSize: 15,
  },
});
