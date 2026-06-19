import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { FullscreenGallery } from './FullscreenGallery';

const { width } = Dimensions.get('window');

interface PropertyHeroGalleryProps {
  images: Array<{ id: string; url: string }>;
  isSaved: boolean;
  moderationStatus?: string;
  onBack: () => void;
  onShare: () => void;
  onToggleSave: () => void;
}

export function PropertyHeroGallery({
  images,
  isSaved,
  moderationStatus,
  onBack,
  onShare,
  onToggleSave,
}: PropertyHeroGalleryProps) {
  const { t } = useTranslation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const showModerationBanner = moderationStatus && moderationStatus !== 'approved';
  const moderationColor = moderationStatus === 'pending' ? 'bg-amber-500' : 'bg-red-500';

  const openImage = (index: number) => {
    setGalleryIndex(index);
    setGalleryVisible(true);
  };

  return (
    <View className="relative w-full bg-gray-100" style={{ height: 320 }}>
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
              <Image
                source={{ uri: img?.url }}
                style={{ width, height: 320 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="camera-outline" size={48} color={Colors.lightMuted} />
          <Text className="mt-2 text-gray-400">
            {t('property.no_photos')}
          </Text>
        </View>
      )}

      {/* Floating header */}
      <SafeAreaView
        edges={['top']}
        className="absolute left-0 right-0 top-0 flex-row justify-between px-4"
      >
        <TouchableOpacity
          onPress={onBack}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onShare}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <Ionicons name="share-social-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onToggleSave}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
          >
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? Colors.yellow : 'white'} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Image counter */}
      {images.length > 1 && (
        <View className="absolute bottom-4 right-4 rounded-xl bg-black/50 px-3 py-1">
          <Text className="text-[13px] font-bold text-white">
            {activeImageIndex + 1}/{images.length}
          </Text>
        </View>
      )}

      {/* Moderation banner over bottom part of image or below it */}
      {showModerationBanner && (
        <View className={`absolute bottom-0 left-0 right-0 px-4 py-2.5 ${moderationColor}`}>
          <Text className="text-[13px] font-bold text-white">
            {moderationStatus === 'pending'
              ? t('property.pending_approval')
              : t('property.listing_inactive')}
          </Text>
        </View>
      )}

      <FullscreenGallery
        images={images}
        initialIndex={galleryIndex}
        visible={galleryVisible}
        onClose={() => setGalleryVisible(false)}
      />
    </View>
  );
}
