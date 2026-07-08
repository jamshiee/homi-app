import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "@constants/colors";
import { formatPrice } from "@utils/price";

interface PropertyIdentitySectionProps {
  transactionType: string;
  isFeatured: boolean;
  isVerified: boolean;
  isNegotiable: boolean;
  title?: string;
  price: string;
  locality?: string;
  district?: string;
  serialNo?: string | null;
}

export function PropertyIdentitySection({
  transactionType,
  isFeatured,
  isVerified,
  isNegotiable,
  title,
  price,
  locality,
  district,
  serialNo,
}: PropertyIdentitySectionProps) {
  const { t } = useTranslation();

  return (
    <View className="px-4 py-5">
  {/* Serial number */}
  {serialNo && (
    <View className="mb-3 self-start flex-row items-center rounded-md bg-gray-100 px-2.5 py-1">
      <Text className="text-[11px] font-bold tracking-widest text-gray-500">
        {serialNo}
      </Text>
    </View>
  )}
  {/* Badges */}
  <View className="mb-4 flex-row flex-wrap items-center gap-2">
    <View className="rounded-lg bg-gray-100 px-2.5 py-1">
      <Text className="text-[11px] font-bold uppercase text-gray-600">
        {t(`transaction.${transactionType}`, transactionType)}
      </Text>
    </View>

    {isFeatured && (
      <View className="rounded-lg bg-yellow-400 px-2.5 py-1">
        <Text className="text-[11px] font-bold text-black">
          {t("property.featured", "Featured")}
        </Text>
      </View>
    )}

    {isVerified && (
      <View className="flex-row items-center rounded-lg bg-green-100 px-2.5 py-1">
        <Ionicons
          name="checkmark-circle"
          size={13}
          color="#16A34A"
        />
        <Text className="ml-1 text-[11px] font-bold text-green-700">
          {t("property.verified", "Verified")}
        </Text>
      </View>
    )}
  </View>

  {/* Price */}
  <View>
    <View className="flex-row items-end flex-wrap">
      <Text className="text-[32px] font-extrabold text-black">
        {formatPrice(price)}
      </Text>

      {transactionType === "rent" && (
        <Text className="ml-2 mb-1 text-[15px] font-medium text-gray-500">
          {t('property.per_month')}
        </Text>
      )}
    </View>

    {isNegotiable && (
      <View className="mt-2 self-start flex-row items-center rounded-full bg-green-50 px-3 py-1">
        <Ionicons
          name="swap-horizontal"
          size={12}
          color="#16A34A"
        />
        <Text className="ml-1 text-[12px] font-semibold text-green-700">
          {t("property.price_negotiable", "Price Negotiable")}
        </Text>
      </View>
    )}
  </View>

  {/* Title */}
  <Text className="mt-4 text-[20px] font-semibold leading-7 text-black">
    {title}
  </Text>

  {/* Location */}
  <View className="mt-3 flex-row items-center">
    <Ionicons
      name="location-outline"
      size={16}
      color={Colors.muted}
    />
    <Text className="ml-1 text-[14px] text-gray-500">
      {locality}, {district}
    </Text>
  </View>
</View>
  );
}
