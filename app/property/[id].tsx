import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Modal,
  Pressable,
  Share,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { useTranslation } from 'react-i18next';
import { usePropertyDetail, useRelatedProperties, useToggleSave } from '@hooks/useProperties';
import { useAuthStore } from '@store/auth.store';
import { isSavedDto, PropertyDto } from '@api/types';
import { propertiesApi } from '@api/properties.api';
import { openWhatsApp, openPhone } from '@utils/contact';
import { formatPrice } from '@utils/price';
import { PropertyCard } from '@components/PropertyCard';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const LISTING_URL = (id: string) => `https://homi.holdings/property/${id}`;

// ─── Skeleton ────────────────────────────────────────────────────────────────
function PropertyDetailSkeleton() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      {/* Hero placeholder */}
      <View style={{ width, height: 260, backgroundColor: Colors.surface }} />
      <View style={{ padding: 16 }}>
        <View style={{ width: 80, height: 24, backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 12 }} />
        <View style={{ width: '70%', height: 22, backgroundColor: Colors.surface, borderRadius: 6, marginBottom: 10 }} />
        <View style={{ width: '50%', height: 28, backgroundColor: Colors.surface, borderRadius: 6, marginBottom: 10 }} />
        <View style={{ width: '60%', height: 16, backgroundColor: Colors.surface, borderRadius: 6, marginBottom: 24 }} />
        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {[80, 100, 90].map((w, i) => (
            <View key={i} style={{ width: w, height: 36, backgroundColor: Colors.surface, borderRadius: 10 }} />
          ))}
        </View>
        {/* Description lines */}
        {[1, 0.9, 0.7].map((op, i) => (
          <View key={i} style={{ width: `${op * 100}%`, height: 14, backgroundColor: Colors.surface, borderRadius: 4, marginBottom: 8 }} />
        ))}
      </View>
    </View>
  );
}

// ─── Fullscreen Gallery ───────────────────────────────────────────────────────
interface GalleryProps {
  images: Array<{ id: string; url: string }>;
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

function FullscreenGallery({ images, initialIndex, visible, onClose }: GalleryProps) {
  const [current, setCurrent] = useState(initialIndex);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && flatRef.current) {
      flatRef.current.scrollToIndex({ index: initialIndex, animated: false });
      setCurrent(initialIndex);
    }
  }, [visible, initialIndex]);

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Close */}
        <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 10, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
          <TouchableOpacity
            onPress={onClose}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </SafeAreaView>

        <FlatList
          ref={flatRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={(e) =>
            setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item }) => (
            <View style={{ width, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Image source={{ uri: item.url }} style={{ width, height: 400 }} resizeMode="contain" />
            </View>
          )}
        />

        {/* Counter */}
        <SafeAreaView edges={['bottom']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 24 }}>
          <View style={{ backgroundColor: Colors.overlay, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}>
            <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 14 }}>
              {current + 1} / {images.length}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data, isLoading } = usePropertyDetail(id);
  const { data: relatedData } = useRelatedProperties(id);
  const toggleSaveMutation = useToggleSave();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AMENITIES' | 'NEIGHBORHOOD'>('OVERVIEW');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [contactSheetVisible, setContactSheetVisible] = useState(false);
  const [numberSheetVisible, setNumberSheetVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const property = data?.data?.data as PropertyDto | undefined;
  const relatedProperties = (relatedData?.data?.data as PropertyDto[]) ?? [];

  // Log view on mount
  useEffect(() => {
    if (id) {
      propertiesApi.logEnquiry(id, 'view').catch(() => null);

      propertiesApi.isSaved(id).then((res)=>{
        const isSaved = (res?.data?.data as isSavedDto).saved
        setIsSaved(isSaved)
      })

    }
  }, [id]);

const images = useMemo(() => {
  return (
    property?.propertyMedia
      ?.slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((m) => ({
        id: m.id,
        url: m.media.url,
      })) ?? []
  );
}, [property?.propertyMedia]);

  const ownerName = property?.listedByUser?.name ?? property?.lister?.name ?? 'Owner';
  const isOwner = user && property?.listedByUser?.id === user.id;
  const lang = user?.preferredLanguage ?? 'en';

  const handleToggleSave = () => {
    if (!property) return;
    setIsSaved((prev) => !prev);
    toggleSaveMutation.mutate(property.id, {
      onError: () => {
        setIsSaved((prev) => !prev);
        Toast.show({ type: 'error', text1: t('error.save_failed', 'Could not update saved status') });
      },
    });
  };

  const handleShare = async () => {
    if (!property) return;
          console.log("preorty Images:",images)

    try {
      await Share.share({ message: `${property.title ?? 'Property'} — ${LISTING_URL(property.id)}` });
    } catch {
      Toast.show({ type: 'info', text1: t('share.link_copied', 'Link copied to clipboard') });
    }
  };

  const handleChat = async () => {
    if (!property) return;
    await propertiesApi.logEnquiry(property.id, 'whatsapp').catch(() => null);
    setContactSheetVisible(false);
    openWhatsApp(property.contactPhone, property.title ?? property.type);
  };

  const handleViewNumber = async () => {
    if (!property) return;
    await propertiesApi.logEnquiry(property.id, 'phone_reveal').catch(() => null);
    setContactSheetVisible(false);
    setNumberSheetVisible(true);
  };

  const handleCall = () => {
    if (!property) return;
    openPhone(property.contactPhone);
  };

  const openImage = (index: number) => {
    setGalleryIndex(index);
    setGalleryVisible(true);
  };

  if (isLoading || !property) {
    return <PropertyDetailSkeleton />;
  }

  // ── Moderation banner ──────────────────────────────────────────────────────
  const showModerationBanner =
    property.moderationStatus && property.moderationStatus !== 'approved';
  const moderationColor =
    property.moderationStatus === 'pending' ? Colors.warning : Colors.error;

  // ── Module stats ───────────────────────────────────────────────────────────
  const renderModuleStats = () => {
    const items: Array<{ icon: string; value: string }> = [];
    if (property.type === 'land') {
      items.push({ icon: 'expand-outline', value: `${property.landDetail?.totalArea ?? 0} ${property.landDetail?.areaUnit ?? 'Cents'}` });
      items.push({ icon: 'car-outline', value: property.landDetail?.hasRoadAccess ? 'Road Access ✓' : 'No Road Access' });
    } else if (property.type === 'house') {
      items.push({ icon: 'bed-outline', value: `${property.houseDetail?.bedrooms ?? 0} Beds` });
      items.push({ icon: 'water-outline', value: `${property.houseDetail?.bathrooms ?? 0} Baths` });
      items.push({ icon: 'layers-outline', value: `${property.houseDetail?.floors ?? 1} Floors` });
      items.push({ icon: 'home-outline', value: property.houseDetail?.furnishingStatus?.replace(/_/g, ' ') ?? '' });
    } else if (property.type === 'building') {
      items.push({ icon: 'expand-outline', value: `${property.buildingDetail?.totalArea ?? 0} sqft` });
      items.push({ icon: 'business-outline', value: `Floor ${property.buildingDetail?.floorNumber ?? 0}` });
      items.push({ icon: 'key-outline', value: property.buildingDetail?.currentStatus ?? 'Vacant' });
      items.push({ icon: 'grid-outline', value: property.buildingDetail?.subType ?? '' });
    } else if (property.type === 'hotel') {
      items.push({ icon: 'bed-outline', value: property.hotelDetail?.roomType ?? 'Single' });
      items.push({ icon: 'home-outline', value: property.hotelDetail?.subType ?? 'Lodge' });
      items.push({ icon: 'people-outline', value: property.hotelDetail?.occupancy ?? 'Single' });
      items.push({ icon: 'restaurant-outline', value: property.hotelDetail?.mealsIncluded ? 'Meals ✓' : 'No Meals' });
    }
    return items.filter((i) => i.value);
  };

  const statsItems = renderModuleStats();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} bounces={false} showsVerticalScrollIndicator={false}>

        {/* ── Hero carousel ── */}
        <View style={{ height: 300, width, backgroundColor: Colors.surface, position: 'relative' }}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) =>
                setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
              }
            >
              {images.map((img, idx) => (
                <TouchableOpacity key={img.id} activeOpacity={0.95} onPress={() => openImage(idx)}>
                  <Image source={{ uri:  img.url }} style={{ width, height: 300 }} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="camera-outline" size={48} color={Colors.lightMuted} />
              <Text style={{ color: Colors.lightMuted, marginTop: 8 }}>
                {t('property.no_photos', 'No photos available')}
              </Text>
            </View>
          )}

          {/* Floating header */}
          <SafeAreaView
            edges={['top']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={handleShare}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="share-social-outline" size={20} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleToggleSave}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? Colors.yellow : Colors.white} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Image counter */}
          {images.length > 1 && (
            <View style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: Colors.overlay, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: Colors.white, fontSize: 13, fontWeight: 'bold' }}>
                {activeImageIndex + 1}/{images.length}
              </Text>
            </View>
          )}
        </View>

        {/* ── Moderation banner ── */}
        {showModerationBanner && (
          <View style={{ backgroundColor: moderationColor, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 13 }}>
              {property.moderationStatus === 'pending'
                ? t('property.pending_approval', 'This listing is pending approval')
                : t('property.listing_inactive', 'This listing is currently inactive')}
            </Text>
          </View>
        )}

        {/* ── Identity ── */}
        <View style={{ padding: 16 }}>
<View className="mb-2 flex-row items-center gap-2">
              <View style={{ backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: Colors.muted, textTransform: 'uppercase' }}>
                {t(`transaction.${property.transactionType}`, `${property.transactionType}`)}
              </Text>
            </View>
            {property.isFeatured && (
              <View style={{ backgroundColor: Colors.yellow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: Colors.dark }}>
                  {t('property.featured', 'Featured')}
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: Colors.dark, marginBottom: 8 }}>
            {property.title}
          </Text>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: Colors.dark, marginBottom: 8 }}>
            {formatPrice(property.price)}
            {property.transactionType === 'rent' && (
              <Text style={{ fontSize: 14, color: Colors.muted }}> / month</Text>
            )}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={16} color={Colors.muted} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 14, color: Colors.muted }}>
              {property.locality}, {property.district}
            </Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 16 }} />

        {/* ── Tabs ── */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 16 }}>
          {(['OVERVIEW', 'AMENITIES', 'NEIGHBORHOOD'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{ marginRight: 24, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: activeTab === tab ? Colors.yellow : 'transparent' }}
            >
              <Text style={{ fontSize: 14, fontWeight: activeTab === tab ? 'bold' : '500', color: activeTab === tab ? Colors.dark : Colors.muted }}>
                {tab === 'NEIGHBORHOOD' ? t('tab.neighborhood', 'Neighborhood') : tab === 'AMENITIES' ? t('tab.amenities', 'Amenities') : t('tab.overview', 'Overview')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Overview tab ── */}
        {activeTab === 'OVERVIEW' && (
          <View style={{ marginTop: 8 }}>
            {/* Stats chips */}
            {statsItems.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
                {statsItems.map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
                    <Ionicons name={item.icon as any} size={16} color={Colors.muted} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.dark }}>{item.value}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Description */}
            <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
              <Text style={{ fontSize: 15, color: Colors.dark, lineHeight: 24 }}>
                {property.description || t('property.no_description', 'No description provided.')}
              </Text>
            </View>

            {/* Posted by */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.dark }}>{ownerName[0]?.toUpperCase()}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.dark }}>{ownerName}</Text>
                <View style={{ backgroundColor: Colors.surface, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 2 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: Colors.muted }}>OWNER</Text>
                </View>
              </View>
              {isOwner && (
                <TouchableOpacity
                  onPress={() => router.push(`/property/${property.id}/edit` as any)}
                  style={{ marginLeft: 'auto', borderWidth: 1.5, borderColor: Colors.dark, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                >
                  <Text style={{ fontWeight: 'bold', fontSize: 13, color: Colors.dark }}>
                    {t('property.edit', 'Edit')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── Amenities tab ── */}
        {activeTab === 'AMENITIES' && (
          <View style={{ padding: 16 }}>
            {property.propertyAmenities && property.propertyAmenities.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {property.propertyAmenities.map(({ amenity }) => (
                  <View
                    key={amenity.id}
                    style={{ width: '30%', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border }}
                  >
                    <Ionicons name={(amenity.iconName as any) || 'checkmark-circle-outline'} size={24} color={Colors.dark} />
                    <Text style={{ fontSize: 11, color: Colors.dark, marginTop: 6, textAlign: 'center', fontWeight: '500' }}>
                      {lang === 'ml' ? amenity.nameMl : amenity.nameEn}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="list-outline" size={40} color={Colors.lightMuted} />
                <Text style={{ color: Colors.muted, marginTop: 12, fontSize: 15 }}>
                  {t('property.no_amenities', 'No amenities listed')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Neighborhood tab ── */}
        {activeTab === 'NEIGHBORHOOD' && (
          <View style={{ padding: 16, alignItems: 'center', paddingVertical: 32 }}>
            <Ionicons name="map-outline" size={40} color={Colors.lightMuted} />
            <Text style={{ color: Colors.muted, marginTop: 12, fontSize: 15 }}>
              {t('property.neighborhood_coming_soon', 'Neighborhood data coming soon')}
            </Text>
          </View>
        )}

        {/* ── Related properties ── */}

      <FlatList
  data={relatedProperties}
  keyExtractor={(item) => item.id}
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{
    paddingHorizontal: 2,
    paddingBottom:15,
    gap: 12,
  }}
  renderItem={({ item: prop }) => (
    <View style={{ width: 380 }}>
      <PropertyCard
        property={prop}
        onPress={(pid) => router.push(`/property/${pid}`)}
        onWhatsAppPress={async (p) => {
          await propertiesApi
            .logEnquiry(p.id, 'whatsapp')
            .catch(() => null);

          openWhatsApp(
            p.contactPhone,
            p.title ?? p.type
          );
        }}
        onCallPress={async (p) => {
          await propertiesApi
            .logEnquiry(p.id, 'phone_reveal')
            .catch(() => null);

          openPhone(p.contactPhone);
        }}
        onViewNumberPress={(p) =>
          router.push(`/property/${p.id}`)
        }
      />
    </View>
  )}
/>
      </ScrollView>

      {/* ── Sticky CTA bar ── */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopWidth: 0.5, borderTopColor: Colors.border }}>
        <SafeAreaView edges={['bottom']} style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
          {/* <TouchableOpacity
            onPress={handleChat}
            style={{ flex: 1, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#25D366', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#25D366', fontWeight: 'bold', fontSize: 15 }}>
              {t('property.chat', 'Chat')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleViewNumber}
            style={{ flex: 1, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.dark, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 15 }}>
              {t('property.view_number', 'View Number')}
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => setContactSheetVisible(true)}
            style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: Colors.yellow, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 15 }}>
              {t('property.contact', 'Contact')}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* ── Contact sheet ── */}
      <Modal visible={contactSheetVisible} transparent animationType="slide" onRequestClose={() => setContactSheetVisible(false)}>
        <View style={{ flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setContactSheetVisible(false)} />
          <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#D1D1D1', borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.dark }}>{ownerName[0]?.toUpperCase()}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.dark }}>{ownerName}</Text>
                <View style={{ backgroundColor: Colors.surface, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: Colors.muted }}>OWNER</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={handleChat} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#25D366', padding: 16, borderRadius: 16, marginBottom: 12 }}>
              <Ionicons name="logo-whatsapp" size={24} color={Colors.white} />
              <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 16, marginLeft: 12 }}>
                {t('property.whatsapp_chat', 'WhatsApp Chat')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleViewNumber} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.dark, padding: 16, borderRadius: 16 }}>
              <Ionicons name="call-outline" size={24} color={Colors.dark} />
              <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 16, marginLeft: 12 }}>
                {t('property.view_number', 'View Number')}
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 20 }}>
              {t('property.contact_note', 'Contact details shared with your number.')}
            </Text>
          </View>
        </View>
      </Modal>

      {/* ── Number reveal sheet ── */}
      <Modal visible={numberSheetVisible} transparent animationType="slide" onRequestClose={() => setNumberSheetVisible(false)}>
        <View style={{ flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setNumberSheetVisible(false)} />
          <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, alignItems: 'center' }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#D1D1D1', borderRadius: 2, marginBottom: 24 }} />
            <Text style={{ fontSize: 11, color: Colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 'bold' }}>
              {t('property.contact_number_label', 'OUR CONTACT NUMBER')}
            </Text>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: Colors.dark, marginBottom: 24 }}>
              {property.contactPhone}
            </Text>
            {property.alternatePhone && (
              <>
                <Text style={{ fontSize: 11, color: Colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 'bold' }}>
                  {t('property.alternate_number_label', 'ALTERNATE NUMBER')}
                </Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.dark, marginBottom: 24 }}>
                  {property.alternatePhone}
                </Text>
              </>
            )}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Share.share({ message: property.contactPhone });
                  } catch {
                    Toast.show({ type: 'info', text1: property.contactPhone });
                  }
                }}
                style={{ flex: 1, height: 56, borderRadius: 30, borderWidth: 1.5, borderColor: Colors.dark, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 16 }}>
                  {t('property.copy', 'Copy')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCall}
                style={{ flex: 1, height: 56, borderRadius: 30, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 16 }}>
                  {t('property.call_now', 'Call Now')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: Colors.muted }}>
                {t('property.verified', 'Verified by Homi Holdings')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Fullscreen gallery ── */}
      <FullscreenGallery
        images={images}
        initialIndex={galleryIndex}
        visible={galleryVisible}
        onClose={() => setGalleryVisible(false)}
      />
    </View>
  );
}
