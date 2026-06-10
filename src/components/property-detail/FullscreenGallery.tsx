import React from "react";
import ImageViewing from "react-native-image-viewing";

interface GalleryProps {
  images: Array<{ id: string; url: string }>;
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

export function FullscreenGallery({
  images,
  initialIndex,
  visible,
  onClose,
}: GalleryProps) {
  return (
    <ImageViewing
      images={images.map((img) => ({
        uri: img.url,
      }))}
      imageIndex={initialIndex}
      visible={visible}
      onRequestClose={onClose}
      swipeToCloseEnabled
      doubleTapToZoomEnabled
    />
  );
}