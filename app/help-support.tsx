import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@constants/colors";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function HelpSupportScreen() {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs: FAQItem[] = [
    {
      id: "post-property",
      question: t("help.faq_post_property_q"),
      answer: t("help.faq_post_property_a"),
    },
    {
      id: "save-property",
      question: t("help.faq_save_property_q"),
      answer: t("help.faq_save_property_a"),
    },
    {
      id: "contact-seller",
      question: t("help.faq_contact_seller_q"),
      answer: t("help.faq_contact_seller_a"),
    },
    {
      id: "edit-property",
      question: t("help.faq_edit_property_q"),
      answer: t("help.faq_edit_property_a"),
    },
    {
      id: "search-filters",
      question: t("help.faq_search_filters_q"),
      answer: t("help.faq_search_filters_a"),
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert(t("common.error_generic"), t("help.feedback_required"));
      return;
    }

    setIsSubmitting(true);
    try {
      const message = encodeURIComponent(feedbackText.trim());
      const whatsappUrl = `https://wa.me/918848084905?text=${message}`;
      await Linking.openURL(whatsappUrl);
      setFeedbackText("");
      Alert.alert(t("help.feedback_sent"), t("help.feedback_sent_body"));
    } catch (err) {
      Alert.alert(t("common.error_generic"), t("help.whatsapp_not_installed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openInstagram = async () => {
    try {
      await Linking.openURL("https://instagram.com/homiholdings");
    } catch {
      Alert.alert(t("common.error_generic"), t("help.instagram_error"));
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
        <Text style={styles.headerTitle}>{t("profile.help_support")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ Section */}
        <View>
          <Text style={styles.sectionTitle}>{t("help.faq_title")}</Text>
          {faqs.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleFAQ(item.id)}
              style={styles.faqItem}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons
                  name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={Colors.muted}
                />
              </View>
              {expandedId === item.id && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("help.feedback_title")}</Text>
          <Text style={styles.sectionSubtitle}>
            {t("help.feedback_subtitle")}
          </Text>
          <TextInput
            style={styles.feedbackInput}
            placeholder={t("help.feedback_placeholder")}
            placeholderTextColor={Colors.lightMuted}
            multiline
            numberOfLines={5}
            value={feedbackText}
            onChangeText={setFeedbackText}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendFeedback}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="logo-whatsapp" size={18} color={Colors.white} />
                <Text style={styles.sendButtonText}>
                  {t("help.send_feedback")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("help.contact_title")}</Text>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL("mailto:info@homiholdings.com")}
          >
            <Ionicons name="mail-outline" size={20} color={Colors.dark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>{t("help.email")}</Text>
              <Text style={styles.contactValue}>info@homiholdings.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactRow}
            onPress={openInstagram}
          >
            <Ionicons name="logo-instagram" size={20} color={Colors.dark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>{t("help.instagram")}</Text>
              <Text style={styles.contactValue}>@homiholdings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactRow, styles.contactRowBorder]}
            onPress={() => Linking.openURL("tel:+918848084905")}
          >
            <Ionicons name="call-outline" size={20} color={Colors.dark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>{t("help.mobile")}</Text>
              <Text style={styles.contactValue}>+91 8848084905</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>

          
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: 16,
    lineHeight: 20,
  },

  // FAQ Styles
  faqItem: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
    marginRight: 8,
  },
  faqAnswer: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  // Feedback Styles
  feedbackInput: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: Colors.dark,
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: Colors.dark,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 15,
  },

  // Contact Styles
  contactRow: {
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
  contactRowBorder: {
    marginBottom: 0,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.lightMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 15,
    color: Colors.dark,
    fontWeight: "500",
    marginTop: 4,
  },
});
