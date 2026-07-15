import { propertiesApi } from "@api/properties.api";
import { isSavedDto, PropertyDto } from "@api/types";
import { Colors } from "@constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  useDeleteProperty,
  usePropertyDetail,
  useRelatedProperties,
  useToggleSave,
} from "@hooks/useProperties";
import { useAuthStore } from "@store/auth.store";
import { openPhone, openWhatsApp } from "@utils/contact";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import Toast from "react-native-toast-message";

// Components
import { PropertyAmenitiesSection } from "@/components/property-detail/PropertyAmenitiesSection";
import { PropertyDescriptionSection } from "@/components/property-detail/PropertyDescriptionSection";
import { PropertyHeroGallery } from "@/components/property-detail/PropertyHeroGallery";
import { PropertyIdentitySection } from "@/components/property-detail/PropertyIdentitySection";
import { PropertyLocationSection } from "@/components/property-detail/PropertyLocationSection";
import { PropertyOwnerSection } from "@/components/property-detail/PropertyOwnerSection";
import { PropertyQuickFactsSection } from "@/components/property-detail/PropertyQuickFactsSection";
import { StickyContactBar } from "@/components/property-detail/StickyContactBar";
import { ConfirmModal } from "@/components/ConfirmModal";
import { formatPrice } from "@/utils/price";

const LISTING_URL = (id: string) => `https://homiholdings.com/property/${id}`;

function PropertyDetailSkeleton() {
  return (
    <View className="flex-1 bg-white">
      <View className="h-[320px] w-full bg-gray-100" />
      <View className="p-4">
        <View className="mb-3 h-6 w-20 rounded-xl bg-gray-100" />
        <View className="mb-2.5 h-6 w-3/4 rounded-md bg-gray-100" />
        <View className="mb-2.5 h-8 w-1/2 rounded-md bg-gray-100" />
        <View className="mb-6 h-4 w-3/5 rounded-md bg-gray-100" />

        <View className="mb-6 flex-row gap-2.5">
          <View className="h-9 w-20 rounded-lg bg-gray-100" />
          <View className="h-9 w-24 rounded-lg bg-gray-100" />
          <View className="h-9 w-20 rounded-lg bg-gray-100" />
        </View>

        <View className="mb-2 h-3.5 w-full rounded bg-gray-100" />
        <View className="mb-2 h-3.5 w-[90%] rounded bg-gray-100" />
        <View className="mb-2 h-3.5 w-[70%] rounded bg-gray-100" />
      </View>
    </View>
  );
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const {
    data,
    isLoading,
    refetch: refetchDetail,
    isRefetching: isRefetchingDetail,
  } = usePropertyDetail(id);
  const {
    data: relatedData,
    refetch: refetchRelated,
    isRefetching: isRefetchingRelated,
  } = useRelatedProperties(id);
  const toggleSaveMutation = useToggleSave();

  const [contactSheetVisible, setContactSheetVisible] = useState(false);
  const [numberSheetVisible, setNumberSheetVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const deleteMutation = useDeleteProperty();

  const property = data?.data?.data as PropertyDto | undefined;
  const relatedProperties = (relatedData?.data?.data as PropertyDto[]) ?? [];

  useEffect(() => {
    if (id) {
      propertiesApi.logEnquiry(id, "view").catch(() => null);

      propertiesApi.isSaved(id).then((res) => {
        const savedStatus = (res?.data?.data as isSavedDto).saved;
        setIsSaved(savedStatus);
      });
    }
  }, [id]);

  const images = useMemo(() => {
    return (
      property?.propertyMedia
        ?.slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((m) => ({
          id: m.id,
          url: m.media?.url,
        })) ?? []
    );
  }, [property?.propertyMedia]);

  const ownerName = property?.lister?.name ?? "Owner";
  const ownerImage = property?.lister?.profileMedia?.url ?? null;
  const isOwner = user && property?.listedByUserId === user.id;
  const lang = user?.preferredLanguage ?? "en";

  const handleToggleSave = () => {
    if (!property) return;
    setIsSaved((prev) => !prev);
    toggleSaveMutation.mutate(property.id, {
      onError: (err) => {
        setIsSaved((prev) => !prev);
        Toast.show({
          type: "error",
          text1: t(
            "error.save_failed",
            `Could not update saved status: ${err}`,
          ),
        });
        console.log("Error while saving property: ", err);
      },
    });
  };

  const handleShare = async () => {
    if (!property) return;
    try {
      const title = property.title || `${property.type} for ${property.transactionType}`;
      const priceStr = formatPrice(property.price);
      await Share.share({
        message: `🏡 ${title}\n\n${priceStr}\n\nView property:\n${LISTING_URL(property.id)}`,
      });
    } catch {
      Toast.show({
        type: "info",
        text1: t("share.link_copied", "Link copied to clipboard"),
      });
    }
  };

  const handleChat = async () => {
    if (!property) return;
    await propertiesApi.logEnquiry(property.id, "whatsapp").catch(() => null);
    setContactSheetVisible(false);
    openWhatsApp(property.contactPhone, LISTING_URL(property.id), property.title ?? property.type, property?.serialNo ?? undefined);
  };

  const handleViewNumber = async () => {
    if (!property) return;
    await propertiesApi
      .logEnquiry(property.id, "phone_reveal")
      .catch(() => null);
    setContactSheetVisible(false);
    setNumberSheetVisible(true);
  };

  const handleCall = () => {
    if (!property) return;
    openPhone(property.contactPhone);
  };

  const handleDeleteProperty = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
    setShowConfirmModal(false);
    router.push("/(tabs)");
  };

  if (isLoading || !property) {
    return <PropertyDetailSkeleton />;
  }

  const onRefresh = async () => {
    await Promise.all([refetchDetail(), refetchRelated()]);
  };
  const isRefreshing = isRefetchingDetail || isRefetchingRelated;

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.yellow]}
            tintColor={Colors.yellow}
          />
        }
      >
        {/* Hero Gallery */}
        <PropertyHeroGallery
          images={images}
          isSaved={isSaved}
          moderationStatus={property.moderationStatus}
          onBack={() => router.back()}
          onShare={handleShare}
          onToggleSave={handleToggleSave}
        />

        {/* Identity Section */}
        <PropertyIdentitySection
          title={property.title}
          price={property.price}
          locality={property.locality}
          district={property.district}
          transactionType={property.transactionType}
          isFeatured={property.isFeatured}
          isNegotiable={property.isNegotiable}
          isVerified={property.isVerified}
          serialNo={property.serialNo}
        />

        <View className="mx-4 h-[1px] bg-gray-200" />

        {/* Quick Facts Section */}
        <PropertyQuickFactsSection property={property} />

        <View className="mx-4 h-[1px] bg-gray-200" />

        {/* Description Section */}
        {property.description && (
          <View>
            <PropertyDescriptionSection description={property.description} />

            <View className="mx-4 h-[1px] bg-gray-200" />
          </View>
        )}

        {/* Amenities Section */}
        <PropertyAmenitiesSection
          amenities={property.propertyAmenities}
          lang={lang}
        />

        <View className="mx-4 h-[1px] bg-gray-200" />

        {/* Location Section */}
        <PropertyLocationSection
          latitude={property.latitude}
          longitude={property.longitude}
          locality={property.locality}
          district={property.district}
        />

        <View className="mx-4 h-[1px] bg-gray-200" />

        {/* Owner Section */}
        {/* <PropertyOwnerSection
          ownerName={ownerName}
          ownerImage={ownerImage}
          isOwner={isOwner ?? false}
          onEdit={() => router.push(`/property/${property.id}/edit` as any)}
          onDelete={()=> setShowConfirmModal(true)}
        /> */}

        {/* Listed Date Section */}
        <View className="px-4 py-5">
          <Text className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
            {t("property.listed_date", "Listed Date")}
          </Text>

          <View className="flex-row items-center rounded-xl bg-gray-50 px-4 py-3">
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#6B7280"
              style={{ marginRight: 10 }}
            />
            <Text className="text-[15px] font-medium text-black">
              {new Date(property.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>



        {/* Related properties */}
        {/* <RelatedPropertiesSection
          properties={relatedProperties}
          onPress={(pid) => router.push(`/property/${pid}`)}
          onWhatsAppPress={async (p) => {
            await propertiesApi.logEnquiry(p.id, 'whatsapp').catch(() => null);
            openWhatsApp(p.contactPhone, p.title ?? p.type);
          }}
          onCallPress={async (p) => {
            await propertiesApi.logEnquiry(p.id, 'phone_reveal').catch(() => null);
            openPhone(p.contactPhone);
          }}
        /> */}
      </ScrollView>

      {/* Sticky CTA bar */}
      <StickyContactBar onContactPress={() => setContactSheetVisible(true)} />

      {/* Contact sheet */}
      <Modal
        visible={contactSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setContactSheetVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable
            className="flex-1"
            onPress={() => setContactSheetVisible(false)}
          />
          <View className="rounded-t-3xl bg-white p-6">
            <View className="mb-6 h-1 w-10 self-center rounded-full bg-gray-300" />

            {/* <View className="mb-6 flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Text className="text-[18px] font-bold text-black">{ownerName[0]?.toUpperCase()}</Text>
              </View>
              <View>
                <Text className="text-[18px] font-bold text-black">{ownerName}</Text>
                <View className="mt-1 self-start rounded-md bg-gray-100 px-2 py-0.5">
                  <Text className="text-[11px] font-bold text-gray-500">{t('property.lister_badge')}</Text>
                </View>
              </View>
            </View> */}

            <TouchableOpacity
              onPress={handleChat}
              className="mb-3 flex-row items-center rounded-2xl bg-[#25D366] p-4"
            >
              <Ionicons name="logo-whatsapp" size={24} color="white" />
              <Text className="ml-3 text-[16px] font-bold text-white">
                {t("property.whatsapp_chat")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleViewNumber}
              className="flex-row items-center rounded-2xl border-[1.5px] border-black p-4"
            >
              <Ionicons name="call-outline" size={24} color="black" />
              <Text className="ml-3 text-[16px] font-bold text-black">
                {t("property.view_number")}
              </Text>
            </TouchableOpacity>

            <Text className="mt-5 text-center text-[12px] text-gray-500">
              {t("property.contact_note")}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Number reveal sheet */}
      <Modal
        visible={numberSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNumberSheetVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable
            className="flex-1"
            onPress={() => setNumberSheetVisible(false)}
          />
          <View className="items-center rounded-t-3xl bg-white p-6">
            <View className="mb-6 h-1 w-10 rounded-full bg-gray-300" />

            <Text className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              {t("property.contact_number_label")}
            </Text>
            <Text className="mb-6 text-[36px] font-bold text-black">
              {property.contactPhone}
            </Text>

            {property.alternatePhone && (
              <>
                <Text className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  {t("property.alternate_number_label")}
                </Text>
                <Text className="mb-6 text-[24px] font-bold text-black">
                  {property.alternatePhone}
                </Text>
              </>
            )}

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Share.share({ message: property.contactPhone });
                  } catch {
                    Toast.show({ type: "info", text1: property.contactPhone });
                  }
                }}
                className="h-14 flex-1 items-center justify-center rounded-full border-[1.5px] border-black"
              >
                <Text className="text-[16px] font-bold text-black">
                  {t("property.copy")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCall}
                className="h-14 flex-1 items-center justify-center rounded-full bg-black"
              >
                <Text className="text-[16px] font-bold text-white">
                  {t("property.call_now")}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-5 flex-row items-center">
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.success}
                style={{ marginRight: 4 }}
              />
              <Text className="text-[12px] text-gray-500">
                {t("property.verified")}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={showConfirmModal}
        title={t("common.confirm")}
        message={t("profile.confirm_delete_listing")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={handleDeleteProperty}
        onCancel={() => setShowConfirmModal(false)}
        isDestructive={true}
      />
    </View>
  );
}
