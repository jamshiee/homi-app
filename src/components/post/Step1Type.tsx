import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { usePostStore } from "@store/postStore";
import { Colors } from "@constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PropertyTypeEnum } from "@/common/enums/property-enums/property-type.enum";
import { useTranslation } from "react-i18next";

export default function Step1Type() {
  const { type, setField, isEditMode } = usePostStore();
  const { t } = useTranslation();

  type TypeOption = {
    key: PropertyTypeEnum;
    labelKey: string;
    descKey: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
  };

  const OPTIONS: TypeOption[] = [
    {
      key: PropertyTypeEnum.HOUSE,
      labelKey: "post.type_house_label",
      descKey: "post.type_house_desc",
      icon: "home-city-outline",
      color: "#3B82F6",
    },
    {
      key: PropertyTypeEnum.LAND,
      labelKey: "post.type_land_label",
      descKey: "post.type_land_desc",
      icon: "image-filter-hdr",
      color: "#10B981",
    },
    {
      key: PropertyTypeEnum.BUILDING,
      labelKey: "post.type_building_label",
      descKey: "post.type_building_desc",
      icon: "office-building-outline",
      color: "#8B5CF6",
    },
    {
      key: PropertyTypeEnum.HOTEL,
      labelKey: "post.type_hotel_label",
      descKey: "post.type_hotel_desc",
      icon: "bed-outline",
      color: "#EC4899",
    },
  ];

  const handleSelect = (key: PropertyTypeEnum) => {
    if (!isEditMode) {
      setField({ type: key });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("post.step1_title")}</Text>
      <Text style={styles.subtitle}>{t("post.step1_subtitle")}</Text>
      {isEditMode && (
        <Text style={styles.editNotice}>{t("post.step1_edit_notice")}</Text>
      )}

      <View style={styles.grid}>
        {OPTIONS.map((opt) => {
          const isSelected = type === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={isEditMode ? 1 : 0.7}
              disabled={isEditMode}
              onPress={() => handleSelect(opt.key)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                isEditMode && styles.cardDisabled,
                { borderLeftColor: opt.color },
              ]}
            >
              <View style={styles.header}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: opt.color + "15" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={opt.icon}
                    size={28}
                    color={opt.color}
                  />
                </View>
                {isSelected && (
                  <View style={styles.badge}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={Colors.yellow}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.label}>{t(opt.labelKey)}</Text>
              <Text style={styles.description}>{t(opt.descKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.lightMuted,
    marginBottom: 12,
  },
  editNotice: {
    fontSize: 12,
    color: Colors.lightMuted,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderLeftWidth: 1.5,
    elevation: 0,
  },
  cardSelected: {
    borderColor: Colors.yellow,
    backgroundColor: Colors.yellow + "05",
  },
  cardDisabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.lightMuted,
    lineHeight: 16,
  },
});
