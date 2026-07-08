import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { useTranslation } from "react-i18next";
import { ModerationStatusEnum } from "@/common/enums/property-enums/moderation-status.enum";

type Props = {
  status?: ModerationStatusEnum;
  reason?: string | null;
};

export function ModerationPanel({
  status,
  reason,
}: Props) {
  const { t } = useTranslation();

  if (!status || status === ModerationStatusEnum.APPROVED) return null;

  const isRejected = status === ModerationStatusEnum.REJECTED;

  return (
    <View
      style={{
        marginBottom: 14,
        padding: 12,
        borderRadius: 12,
        backgroundColor: isRejected
          ? Colors.error + "10"
          : Colors.warning + "12",
        borderWidth: 1,
        borderColor: isRejected
          ? Colors.error + "30"
          : Colors.warning + "30",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name={
            isRejected
              ? "alert-circle-outline"
              : "clock-outline"
          }
          size={18}
          color={isRejected ? Colors.error : Colors.warning}
        />

        <Text
          style={{
            marginLeft: 8,
            fontWeight: "700",
            fontSize: 14,
            color: isRejected
              ? Colors.error
              : Colors.warning,
          }}
        >
          {isRejected
            ? t("property.action_required", "Action Required")
            : t("property.review_in_progress", "Review in Progress")}
        </Text>
      </View>

      <Text
        style={{
          marginTop: 8,
          fontSize: 13,
          color: Colors.muted,
          lineHeight: 20,
        }}
      >
        {isRejected
          ? t(
              "property.edit_to_resubmit",
              "Edit this listing to submit it for review again."
            )
          : t(
              "property.review_description",
              "Your listing is being reviewed and will become visible once approved."
            )}
      </Text>

      {isRejected && !!reason && (
        <View
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            backgroundColor: Colors.white,
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              color: Colors.dark,
              marginBottom: 4,
            }}
          >
            {t("property.reason", "Reason")}
          </Text>

          <Text
            style={{
              color: Colors.muted,
              lineHeight: 19,
            }}
          >
            {reason}
          </Text>
        </View>
      )}
    </View>
  );
}