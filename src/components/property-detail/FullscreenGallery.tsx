import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';

const { width } = Dimensions.get('window');

interface GalleryProps {
  images: Array<{ id: string; url: string }>;
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

export function FullscreenGallery({ images, initialIndex, visible, onClose }: GalleryProps) {
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
      <View className="flex-1 bg-black">
        {/* Close */}
        <SafeAreaView edges={['top']} className="absolute left-0 right-0 top-2 z-10 flex-row justify-end p-2.5">
          <TouchableOpacity
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
          >
            <Ionicons name="close" size={24} color="white" />
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
            <View className="h-full items-center justify-center" style={{ width }}>
              <Image source={{ uri: item.url }} style={{ width, height: 400 }} resizeMode="contain" />
            </View>
          )}
        />

        {/* Counter */}
        <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 items-center pb-6">
          <View className="rounded-full bg-black/50 px-4 py-1.5">
            <Text className="text-[14px] font-bold text-white">
              {current + 1} / {images.length}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
