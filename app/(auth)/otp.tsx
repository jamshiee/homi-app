import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { Colors } from "@constants/colors";
import { Config } from "@constants/config";
import { authApi } from "@api/auth.api";
import { useAuthStore } from "@store/auth.store";
import { useAppStore } from "@store/app.store";

export default function OtpScreen() {
  const { t, i18n } = useTranslation();
  const { language } = useAppStore();
  const { phone, channel } = useLocalSearchParams<{
    phone: string;
    channel: "whatsapp" | "sms";
  }>();
  const { login, isLoading, setLoading } = useAuthStore();

  const [otp, setOtp] = useState(Array(Config.OTP_LENGTH).fill(""));
  const [activeIdx, setActiveIdx] = useState(0);
  const [countdown, setCountdown] = useState<number>(Config.OTP_RESEND_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (countdown === 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleChange = (value: string, idx: number) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return;
    if (digits.length === Config.OTP_LENGTH) {
      const filled = digits.split("");
      setOtp(filled);
      inputRefs.current[Config.OTP_LENGTH - 1]?.focus();
      setTimeout(() => void verify(filled.join("")), 100);
      return;
    }
    const next = [...otp];
    next[idx] = digits[0] ?? "";
    setOtp(next);
    if (idx < Config.OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
      setActiveIdx(idx + 1);
    }
    if (next.every((d) => d)) setTimeout(() => void verify(next.join("")), 100);
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key !== "Backspace") return;
    const next = [...otp];
    if (otp[idx]) {
      next[idx] = "";
      setOtp(next);
    } else if (idx > 0) {
      next[idx - 1] = "";
      setOtp(next);
      inputRefs.current[idx - 1]?.focus();
      setActiveIdx(idx - 1);
    }
  };

  const verify = async (code?: string) => {
    const c = code ?? otp.join("");
    if (c.length !== Config.OTP_LENGTH) return;
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, c, language);
      const data = res.data.data;
      
      // Sync language from backend if it's different
      if (data.user.preferredLanguage && data.user.preferredLanguage !== language) {
        console.log(`user reponse data ${JSON.stringify(data.user)}`)
        console.log(`syncing language from ${language} to ${data.user.preferredLanguage}`)
        await useAppStore.getState().setLanguage(data.user.preferredLanguage);
      }

      await login(data);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(data.isNewUser ? "/(auth)/name" : "/(tabs)");
    } catch (err: unknown) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const ax = err as { response?: { data?: { message?: string } } };
      console.log({ ax });
      Toast.show({
        type: "error",
        text1: ax?.response?.data?.message || t("common.error_generic"),
      });
      setOtp(Array(Config.OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await authApi.sendOtp(phone);
      setCountdown(Config.OTP_RESEND_SECONDS);
      setOtp(Array(Config.OTP_LENGTH).fill(""));
      setActiveIdx(0);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      console.log({ ax });
      Toast.show({
        type: "error",
        text1: ax?.response?.data?.message || t("common.error_generic"),
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.yellow }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center" }}
        >
          <Text
            style={{
              fontSize: 48,
              fontWeight: "600",
              color: Colors.dark,
              textAlign: "left",
            }}
          >
            {t("auth.otp_title")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.muted,
              textAlign: "left",
              marginTop: 6,
              marginBottom: 20,
            }}
          >
            {t("auth.otp_subtitle", { phone })}
          </Text>

          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}
          >
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  inputRefs.current[i] = r;
                }}
                style={{
                  width: 48,
                  height: 58,
                  backgroundColor: Colors.softYellow,
                  borderRadius: 10,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: "600",
                  color: Colors.dark,
                  borderWidth: 1.5,
                  borderColor:
                    activeIdx === i ? Colors.borderFocus : "transparent",
                }}
                keyboardType="numeric"
                maxLength={Config.OTP_LENGTH}
                value={digit}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, i)
                }
                onFocus={() => setActiveIdx(i)}
                selectTextOnFocus
              />
            ))}
          </View>

          <Text
            style={{
              fontSize: 12,
              color: Colors.muted,
              textAlign: "left",
              marginTop: 10,
            }}
          >
            {channel === "whatsapp"
              ? `${t("auth.otp_whatsapp")}`
              : `${t("auth.otp_sms")}`}
          </Text>

          <TouchableOpacity
            onPress={handleResend}
            style={{ marginTop: 20, alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 14,
                color: countdown > 0 ? Colors.lightMuted : Colors.dark,
                fontWeight: "500",
              }}
            >
              {countdown > 0
                ? t("auth.resend_in", { seconds: countdown })
                : t("auth.resend")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              marginTop: 24,
              backgroundColor: otp.every((d) => d)
                ? Colors.dark
                : Colors.border,
              borderRadius: 30,
              height: 56,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => void verify()}
            disabled={!otp.every((d) => d) || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text
                style={{ color: Colors.white, fontWeight: "600", fontSize: 16 }}
              >
                {t("auth.verify_cta")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 16, alignItems: "center" }}
          >
            <Text style={{ fontSize: 13, color: Colors.muted }}>
              {t("auth.change_number")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
