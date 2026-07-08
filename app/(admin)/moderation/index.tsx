import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@constants/colors";
import { adminPropertiesApi } from "@api/admin-properties.api";
import { PropertyDto } from "@api/types";
import { formatPrice } from "@utils/price";
import { router, useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabKey = "pending" | "rejected" | "approved";

interface FetchParams {
  moderationStatus: TabKey;
  keyword?: string;
  type?: string;
  page: number;
}

const PAGE_SIZE = 20;

// Built at render time with t() — defined as factory so translations are live
const getTabs = (t: (k: string) => string) => [
  { key: "pending"  as TabKey, label: t("moderation.tab_pending"),  color: Colors.warning },
  { key: "rejected" as TabKey, label: t("moderation.tab_rejected"), color: Colors.error   },
  { key: "approved" as TabKey, label: t("moderation.tab_approved"), color: Colors.success  },
];

const getTypePills = (t: (k: string) => string) => [
  { key: "",         label: t("moderation.filter_all")      },
  { key: "land",     label: t("moderation.filter_land")     },
  { key: "house",    label: t("moderation.filter_house")    },
  { key: "building", label: t("moderation.filter_building") },
  { key: "hotel",    label: t("moderation.filter_hotel")    },
];

// ─── Rejection modal ──────────────────────────────────────────────────────────
function RejectModal({
  visible,
  onClose,
  onConfirm,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={modalStyles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>{t("moderation.reject_modal_title")}</Text>
          <Text style={modalStyles.subtitle}>{t("moderation.reject_modal_subtitle")}</Text>
          <TextInput
            style={modalStyles.input}
            placeholder={t("moderation.reject_modal_placeholder")}
            placeholderTextColor={Colors.lightMuted}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
          />
          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} disabled={isLoading}>
              <Text style={modalStyles.cancelText}>{t("moderation.reject_modal_cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.confirmBtn} onPress={handleConfirm} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <Text style={modalStyles.confirmText}>{t("moderation.reject_modal_confirm")}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ModerationQueueScreen() {
  const { t } = useTranslation();
  const TABS = getTabs(t);
  const TYPE_PILLS = getTypePills(t);

  const [activeTab, setActiveTab]   = useState<TabKey>("pending");
  const [typeFilter, setTypeFilter] = useState("");
  const [keyword, setKeyword]       = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [isLoading, setIsLoading]   = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Moderation action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget]   = useState<string | null>(null);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (params: FetchParams, append = false) => {
      try {
        const query: Record<string, any> = {
          moderationStatus: params.moderationStatus,
          page: params.page,
          limit: PAGE_SIZE,
        };
        if (params.keyword) query.keyword = params.keyword;
        if (params.type)    query.type    = params.type;

        const { data } = await adminPropertiesApi.getAdminAll(query as any);
        // Runtime shape of paginated admin/all: { data: PropertyDto[], meta: {...} }
        const payload = data.data as  PropertyDto[];
        const items: PropertyDto[] = payload ?? [];
        const meta = data.meta;

        setProperties((prev) => (append ? [...prev, ...items] : items));
        setHasMore(meta ? meta.page < meta.totalPages : false);
      } catch (e: any) {
        Toast.show({ type: "error", text1: t("moderation.fetch_failed") });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  const reload = useCallback(
    (tab = activeTab, kw = keyword, type = typeFilter) => {
      setIsLoading(true);
      setPage(1);
      setHasMore(true);
      fetchPage({ moderationStatus: tab, keyword: kw, type, page: 1 });
    },
    [activeTab, fetchPage, keyword, typeFilter],
  );

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    reload(tab, keyword, typeFilter);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    reload(activeTab, keyword, type);
  };

  const handleSearchChange = (text: string) => {
    setSearchInput(text);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setKeyword(text);
      reload(activeTab, text, typeFilter);
    }, 400);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    reload();
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    setPage(nextPage);
    fetchPage({ moderationStatus: activeTab, keyword, type: typeFilter, page: nextPage }, true);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id + "_approve");
    try {
      await adminPropertiesApi.moderateProperty(id, { status: "approved" });
      Toast.show({ type: "success", text1: t("moderation.action_approve_success") });
      reload();
    } catch (e: any) {
      Toast.show({ type: "error", text1: t("moderation.action_approve_failed") });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    const id = rejectTarget;
    setActionLoading(id + "_reject");
    try {
      await adminPropertiesApi.moderateProperty(id, { status: "rejected", rejectionReason: reason || undefined });
      Toast.show({ type: "success", text1: t("moderation.action_reject_success") });
      setRejectTarget(null);
      reload();
    } catch (e: any) {
      Toast.show({ type: "error", text1: t("moderation.action_reject_failed") });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const renderItem = ({ item: p }: { item: PropertyDto }) => {
    const cover =
      p.propertyMedia?.find((m) => m.isCover)?.media?.url ||
      p.propertyMedia?.[0]?.media?.url;

    const isApprovingThis = actionLoading === p.id + "_approve";
    const isRejectingThis = actionLoading === p.id + "_reject";

    return (
      <View style={styles.card}>
        {/* Top row: image + info */}
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={styles.cardImageWrap}
            onPress={() => router.push(`/property/${p.id}` as any)}
          >
            {cover ? (
              <Image source={{ uri: cover }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.noImage]}>
                <Ionicons name="image-outline" size={22} color={Colors.muted} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {p.title || `${p.type} · ${p.transactionType}`}
            </Text>
            <Text style={styles.cardLocation} numberOfLines={1}>
              {p.locality}, {p.district}
            </Text>
            <Text style={styles.cardPrice}>{formatPrice(p.price)}</Text>

            <View style={styles.metaRow}>
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>{p.type?.toUpperCase()}</Text>
              </View>
              {p.lister && (
                <Text style={styles.listerText} numberOfLines={1}>
                  {t("moderation.by_lister", { name: p.lister.name ?? "User" })}
                </Text>
              )}
            </View>

            <Text style={styles.dateText}>
              {new Date(p.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </Text>

            {/* Rejection reason (shown in rejected/approved tabs) */}
            {(p as any).rejectionReason && (
              <View style={styles.rejectionBadge}>
                <MaterialCommunityIcons name="information-outline" size={12} color={Colors.error} />
                <Text style={styles.rejectionBadgeText} numberOfLines={2}>
                  {(p as any).rejectionReason}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => router.push(`/property/${p.id}` as any)}
          >
            <Ionicons name="eye-outline" size={15} color={Colors.muted} />
            <Text style={styles.viewBtnText}>{t("moderation.action_view")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/property/${p.id}/edit` as any)}
          >
            <Ionicons name="pencil-outline" size={15} color={Colors.dark} />
            <Text style={styles.editBtnText}>{t("moderation.action_edit")}</Text>
          </TouchableOpacity>

          {/* Approve — shown on pending and rejected tabs */}
          {activeTab !== "approved" && (
            <TouchableOpacity
              style={[styles.approveBtn, isApprovingThis && styles.btnLoading]}
              onPress={() => handleApprove(p.id)}
              disabled={!!actionLoading}
            >
              {isApprovingThis
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <>
                    <Ionicons name="checkmark" size={15} color={Colors.white} />
                    <Text style={styles.approveBtnText}>{t("moderation.action_approve")}</Text>
                  </>
              }
            </TouchableOpacity>
          )}

          {/* Reject — shown on pending and approved tabs */}
          {activeTab !== "rejected" && (
            <TouchableOpacity
              style={[styles.rejectBtn, isRejectingThis && styles.btnLoading]}
              onPress={() => setRejectTarget(p.id)}
              disabled={!!actionLoading}
            >
              {isRejectingThis
                ? <ActivityIndicator size="small" color={Colors.error} />
                : <>
                    <Ionicons name="close" size={15} color={Colors.error} />
                    <Text style={styles.rejectBtnText}>{t("moderation.action_reject")}</Text>
                  </>
              }
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("moderation.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.lightMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("moderation.search_placeholder")}
          placeholderTextColor={Colors.lightMuted}
          value={searchInput}
          onChangeText={handleSearchChange}
          returnKeyType="search"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchInput(""); handleSearchChange(""); }}>
            <Ionicons name="close-circle" size={18} color={Colors.lightMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: tab.color, borderBottomWidth: 2 }]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && { color: tab.color, fontWeight: "700" }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Type filter pills */}
      <View style={styles.pillsRow}>
        {TYPE_PILLS.map((pill) => (
          <TouchableOpacity
            key={pill.key}
            style={[styles.pill, typeFilter === pill.key && styles.pillActive]}
            onPress={() => handleTypeFilter(pill.key)}
          >
            <Text style={[styles.pillText, typeFilter === pill.key && styles.pillTextActive]}>
              {pill.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.dark} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore
              ? <ActivityIndicator style={{ marginVertical: 16 }} color={Colors.dark} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons
                name={activeTab === "pending" ? "clock-outline" : activeTab === "rejected" ? "close-circle-outline" : "check-circle-outline"}
                size={48}
                color={Colors.border}
              />
              <Text style={styles.emptyText}>
                {t(`moderation.empty_${activeTab}`)}
              </Text>
            </View>
          }
        />
      )}

      {/* Reject modal */}
      <RejectModal
        visible={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        isLoading={actionLoading?.endsWith("_reject") ?? false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.white },
  center:       { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.dark, flex: 1, textAlign: "center" },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.dark },

  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 14, fontWeight: "500", color: Colors.lightMuted },

  pillsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: { backgroundColor: Colors.dark, borderColor: Colors.dark },
  pillText:   { fontSize: 12, fontWeight: "600", color: Colors.muted },
  pillTextActive: { color: Colors.white },

  listContent: { padding: 16, paddingBottom: 60 },

  emptyWrap:  { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText:  { fontSize: 15, color: Colors.lightMuted, fontWeight: "500" },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardRow: { flexDirection: "row", padding: 12, gap: 12 },
  cardImageWrap: {
    width: 84,
    height: 84,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    flexShrink: 0,
  },
  cardImage:  { width: "100%", height: "100%" },
  noImage:    { justifyContent: "center", alignItems: "center" },
  cardInfo:   { flex: 1, gap: 3 },
  cardTitle:  { fontSize: 14, fontWeight: "700", color: Colors.dark },
  cardLocation: { fontSize: 12, color: Colors.muted },
  cardPrice:  { fontSize: 14, fontWeight: "800", color: Colors.dark },
  metaRow:    { flexDirection: "row", alignItems: "center", gap: 8 },
  typePill: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typePillText: { fontSize: 10, fontWeight: "bold", color: Colors.white },
  listerText:   { fontSize: 12, color: Colors.muted, flex: 1 },
  dateText:     { fontSize: 11, color: Colors.lightMuted },
  rejectionBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    backgroundColor: Colors.error + "10",
    borderRadius: 6,
    padding: 6,
    marginTop: 2,
  },
  rejectionBadgeText: { fontSize: 11, color: Colors.error, flex: 1, lineHeight: 15 },

  // Action buttons
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
    flexWrap: "wrap",
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewBtnText: { fontSize: 12, color: Colors.muted, fontWeight: "600" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: { fontSize: 12, color: Colors.dark, fontWeight: "600" },
  approveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.success,
  },
  approveBtnText: { fontSize: 12, color: Colors.white, fontWeight: "700" },
  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.error + "15",
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  rejectBtnText: { fontSize: 12, color: Colors.error, fontWeight: "700" },
  btnLoading: { opacity: 0.7 },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title:    { fontSize: 18, fontWeight: "700", color: Colors.dark, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.muted, marginBottom: 16 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: "top",
    minHeight: 80,
    marginBottom: 20,
  },
  actions:   { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: Colors.dark },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.error,
    alignItems: "center",
  },
  confirmText: { fontSize: 15, fontWeight: "700", color: Colors.white },
});
