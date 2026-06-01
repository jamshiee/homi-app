import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  PanResponder,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { usePostStore } from "../../store/postStore";
import { Colors } from "../../constants/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GAP = 8;
const COVER_HEIGHT = 180;
const COLS = 3;

// Helper to calculate absolute position and dimensions for any given slot index
const getSlotPosition = (index: number, containerWidth: number) => {
  const subItemWidth = (containerWidth - GAP * (COLS - 1)) / COLS;
  const subItemHeight = subItemWidth + 10;

  if (index === 0) {
    return { x: 0, y: 0, width: containerWidth, height: COVER_HEIGHT };
  } else {
    const localIndex = index - 1;
    const row = Math.floor(localIndex / COLS);
    const col = localIndex % COLS;
    const x = col * (subItemWidth + GAP);
    const y = COVER_HEIGHT + GAP + row * (subItemHeight + GAP);
    return { x, y, width: subItemWidth, height: subItemHeight };
  }
};

// Helper to calculate overall container height
const getContainerHeight = (count: number, containerWidth: number) => {
  if (count === 0) return 0;
  const subItemWidth = (containerWidth - GAP * (COLS - 1)) / COLS;
  const subItemHeight = subItemWidth + 10;

  if (count === 1) return COVER_HEIGHT;
  const rows = Math.ceil((count - 1) / COLS);
  return COVER_HEIGHT + GAP + rows * (subItemHeight + GAP);
};

interface DraggableTileProps {
  uri: string;
  visualIndex: number;
  containerWidth: number;
  isCover: boolean;
  onDragStart: (uri: string, visualIndex: number) => void;
  onDragMove: (uri: string, dx: number, dy: number) => void;
  onDragEnd: (uri: string) => void;
  onRemove: () => void;
  onSetCover: () => void;
  animatedPos: Animated.ValueXY;
}

function DraggableTile({
  uri,
  visualIndex,
  containerWidth,
  isCover,
  onDragStart,
  onDragMove,
  onDragEnd,
  onRemove,
  onSetCover,
  animatedPos,
}: DraggableTileProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDragging = useRef(false);
  const longPressTimeout = useRef<any>(null);

  // Get target size based on visual slot index
  const slotPos = getSlotPosition(visualIndex, containerWidth);
  const animWidth = useRef(new Animated.Value(slotPos.width)).current;
  const animHeight = useRef(new Animated.Value(slotPos.height)).current;

  // Spring anim width/height when item changes between Cover and Grid slots
  useEffect(() => {
    Animated.parallel([
      Animated.spring(animWidth, {
        toValue: slotPos.width,
        useNativeDriver: false,
        friction: 8,
        tension: 50,
      }),
      Animated.spring(animHeight, {
        toValue: slotPos.height,
        useNativeDriver: false,
        friction: 8,
        tension: 50,
      }),
    ]).start();
  }, [slotPos.width, slotPos.height]);

  // Keep props in refs to avoid stale closures in PanResponder
  const propsRef = useRef({ onDragStart, onDragMove, onDragEnd, visualIndex });
  useEffect(() => {
    propsRef.current = { onDragStart, onDragMove, onDragEnd, visualIndex };
  }, [onDragStart, onDragMove, onDragEnd, visualIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => isDragging.current,
      onPanResponderGrant: () => {
        // Start long-press timer to lift the tile
        longPressTimeout.current = setTimeout(() => {
          isDragging.current = true;
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.spring(scale, {
            toValue: 1.06,
            useNativeDriver: false,
          }).start();
          propsRef.current.onDragStart(uri, propsRef.current.visualIndex);
        }, 250); // 250ms feel snappy but prevents accidental scroll drags
      },
      onPanResponderMove: (_, gestureState) => {
        if (isDragging.current) {
          propsRef.current.onDragMove(uri, gestureState.dx, gestureState.dy);
        } else {
          // Cancel drag lift if user starts scrolling or moving too much
          if (
            Math.abs(gestureState.dx) > 10 ||
            Math.abs(gestureState.dy) > 10
          ) {
            if (longPressTimeout.current) {
              clearTimeout(longPressTimeout.current);
            }
          }
        }
      },
      onPanResponderRelease: () => {
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
        }
        if (isDragging.current) {
          isDragging.current = false;
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
          propsRef.current.onDragEnd(uri);
        }
      },
      onPanResponderTerminate: () => {
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
        }
        if (isDragging.current) {
          isDragging.current = false;
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
          propsRef.current.onDragEnd(uri);
        }
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          width: animWidth,
          height: animHeight,
          transform: [
            { translateX: animatedPos.x },
            { translateY: animatedPos.y },
            { scale: scale },
          ],
          zIndex: isDragging.current ? 99 : 1,
          elevation: isDragging.current ? 10 : 2,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Image source={{ uri }} style={styles.image} />

      <View
        style={[styles.badge, isCover ? styles.coverBadge : styles.orderBadge]}
      >
        <Text style={[styles.badgeText, isCover && styles.coverBadgeText]}>
          {isCover ? "COVER IMAGE" : `${visualIndex + 1}`}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onRemove}
        style={styles.removeBtn}
      >
        <MaterialCommunityIcons name="close" size={14} color={Colors.white} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSetCover}
        style={styles.coverActionBtn}
      >
        <MaterialCommunityIcons
          name={isCover ? "star" : "star-outline"}
          size={16}
          color={Colors.yellow}
        />
      </TouchableOpacity>

      {isCover && (
        <View style={styles.coverLabelRow}>
          <MaterialCommunityIcons name="star" size={12} color={Colors.yellow} />
          <Text style={styles.coverLabelText}>
            Primary photo shown in feed search
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function Step6Photos() {
  const { photos, setField } = usePostStore();

  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get("window").width - 32,
  );

  // order is the array of photo URIs reflecting the visual sequence
  const [order, setOrder] = useState<string[]>([]);
  const orderRef = useRef<string[]>([]);
  const photosRef = useRef<typeof photos>([]);

  // Keep refs in sync for gesture responder contexts
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const updateOrder = (newOrder: string[]) => {
    setOrder(newOrder);
    orderRef.current = newOrder;
  };

  // Track dragging state
  const draggingUri = useRef<string | null>(null);
  const draggedStartPos = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Animated value cache keyed by image URIs
  const animatedPositions = useRef<Record<string, Animated.ValueXY>>(
    {},
  ).current;

  // Initialize and keep order in sync with incoming store updates (e.g. initial load or new pickers)
  useEffect(() => {
    const photoUris = photos.map((p) => p.uri);
    // Only update order from store if we are not actively dragging to avoid interrupting layout state
    if (!draggingUri.current) {
      updateOrder(photoUris);
    }
  }, [photos]);

  // Ensure all photos in the visual order have Animated.ValueXY instances
  order.forEach((uri, idx) => {
    if (!animatedPositions[uri]) {
      const slotPos = getSlotPosition(idx, containerWidth);
      animatedPositions[uri] = new Animated.ValueXY({
        x: slotPos.x,
        y: slotPos.y,
      });
    }
  });

  // Whenever visual order changes, spring non-dragged items to their new slot coordinates
  useEffect(() => {
    order.forEach((uri, idx) => {
      if (uri !== draggingUri.current) {
        const slotPos = getSlotPosition(idx, containerWidth);
        Animated.spring(animatedPositions[uri], {
          toValue: { x: slotPos.x, y: slotPos.y },
          useNativeDriver: false,
          friction: 7,
          tension: 40,
        }).start();
      }
    });
  }, [order, containerWidth]);

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to upload photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const selected = result.assets.map((asset) => ({
        uri: asset.uri,
        isCover: false,
      }));

      const combined = [...photos, ...selected].slice(0, 10);
      const hasCover = combined.some((p) => p.isCover);
      const updated = combined.map((p, idx) => ({
        ...p,
        isCover: hasCover ? p.isCover : idx === 0,
      }));

      setField({ photos: updated });
    }
  };

  const handleRemovePhoto = (uriToRemove: string) => {
    const removedPhoto = photos.find((p) => p.uri === uriToRemove);
    const nextPhotos = photos.filter((p) => p.uri !== uriToRemove);

    if (removedPhoto?.isCover && nextPhotos.length > 0) {
      nextPhotos[0] = { ...nextPhotos[0], isCover: true };
    }

    delete animatedPositions[uriToRemove];
    setField({
      photos: nextPhotos.map((p, idx) => ({
        ...p,
        isCover: idx === 0,
      })),
    });
  };

  const handleSetCover = (uriToCover: string) => {
    setField({
      photos: photos.map((p) => ({
        ...p,
        isCover: p.uri === uriToCover,
      })),
    });
  };

  const onDragStart = (uri: string, visualIndex: number) => {
    draggingUri.current = uri;
    draggedStartPos.current = getSlotPosition(visualIndex, containerWidth);
    // Lock parent ScrollView from scrolling
    setField({ scrollEnabled: false });
  };

  const onDragMove = (uri: string, dx: number, dy: number) => {
    if (!draggedStartPos.current || !animatedPositions[uri]) return;

    const currentX = draggedStartPos.current.x + dx;
    const currentY = draggedStartPos.current.y + dy;

    // Direct offset update for the dragged item
    animatedPositions[uri].setValue({ x: currentX, y: currentY });

    const dragWidth = draggedStartPos.current.width;
    const dragHeight = draggedStartPos.current.height;
    const centerX = currentX + dragWidth / 2;
    const centerY = currentY + dragHeight / 2;

    const currentOrder = orderRef.current;

    // Find the slot closest to the current center point of the dragged item
    let minDistance = Infinity;
    let targetIndex = currentOrder.indexOf(uri);

    for (let i = 0; i < currentOrder.length; i++) {
      const slotPos = getSlotPosition(i, containerWidth);
      const slotCenterX = slotPos.x + slotPos.width / 2;
      const slotCenterY = slotPos.y + slotPos.height / 2;

      const distance = Math.sqrt(
        Math.pow(centerX - slotCenterX, 2) + Math.pow(centerY - slotCenterY, 2),
      );

      if (distance < minDistance) {
        minDistance = distance;
        targetIndex = i;
      }
    }

    const currentIndex = currentOrder.indexOf(uri);
    if (targetIndex !== currentIndex) {
      const newOrder = [...currentOrder];
      newOrder.splice(currentIndex, 1);
      newOrder.splice(targetIndex, 0, uri);

      // Update local order, which triggers layout animations for the other items
      updateOrder(newOrder);
    }
  };

  const onDragEnd = (uri: string) => {
    draggingUri.current = null;
    draggedStartPos.current = null;

    // Unlock parent ScrollView scrolling
    setField({ scrollEnabled: true });

    // Spring the dragged item to its final visual slot position
    const currentOrder = orderRef.current;
    const finalIndex = currentOrder.indexOf(uri);
    const slotPos = getSlotPosition(finalIndex, containerWidth);

    Animated.spring(animatedPositions[uri], {
      toValue: { x: slotPos.x, y: slotPos.y },
      useNativeDriver: false,
      friction: 7,
      tension: 40,
    }).start();

    const sortedPhotos = currentOrder
      .map((u) => photosRef.current.find((p) => p.uri === u))
      .filter(Boolean) as typeof photos;

    const hasCover = sortedPhotos.some((p) => p.isCover);
    const updated = sortedPhotos.map((p, idx) => ({
      ...p,
      isCover: hasCover ? p.isCover : idx === 0,
    }));

    setField({ photos: updated });
  };

  const hasPhotos = order.length > 0;
  const showCompactAdd = hasPhotos && order.length < 10;
  const totalCount = order.length + (showCompactAdd ? 1 : 0);
  const gridHeight = getContainerHeight(totalCount, containerWidth);

  // Get coordinates for compact add button
  const compactAddPos = showCompactAdd
    ? getSlotPosition(order.length, containerWidth)
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Property Photos</Text>
      <Text style={styles.subtitle}>
        Drag and drop photos to reorder. Tap the star to choose the primary
        cover image.
      </Text>

      {/* Large Upload Button shown only if no photos are selected */}
      {!hasPhotos && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePickImages}
          style={styles.largeUploadButton}
        >
          <MaterialCommunityIcons
            name="cloud-upload"
            size={48}
            color={Colors.yellow}
          />
          <Text style={styles.uploadButtonText}>
            Select Photos from Gallery
          </Text>
          <Text style={styles.uploadSubtext}>
            Upload up to 10 high-quality photos
          </Text>
        </TouchableOpacity>
      )}

      {/* Draggable Sorting Grid */}
      {hasPhotos && (
        <View
          style={[styles.gridContainer, { height: gridHeight }]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) setContainerWidth(w);
          }}
        >
          {order.map((uri, idx) => (
            <DraggableTile
              key={uri}
              uri={uri}
              visualIndex={idx}
              containerWidth={containerWidth}
              isCover={photos.find((p) => p.uri === uri)?.isCover ?? false}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              onRemove={() => handleRemovePhoto(uri)}
              onSetCover={() => handleSetCover(uri)}
              animatedPos={animatedPositions[uri]}
            />
          ))}

          {/* Compact '+' button rendered inside the grid flow */}
          {showCompactAdd && compactAddPos && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickImages}
              style={[
                styles.compactAddTile,
                {
                  position: "absolute",
                  left: compactAddPos.x,
                  top: compactAddPos.y,
                  width: compactAddPos.width,
                  height: compactAddPos.height,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="plus"
                size={32}
                color={Colors.yellow}
              />
              <Text style={styles.compactAddText}>Add More</Text>
              <Text style={styles.compactAddCount}>({order.length}/10)</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {hasPhotos && (
        <View style={styles.tipRow}>
          <MaterialCommunityIcons
            name="gesture-tap-hold"
            size={16}
            color={Colors.lightMuted}
          />
          <Text style={styles.tipText}>
            Press and hold a photo to drag & reorder
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.lightMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  largeUploadButton: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.yellow,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    color: Colors.lightMuted,
    marginTop: 6,
  },
  gridContainer: {
    position: "relative",
    width: "100%",
  },
  tile: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.surface,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  coverBadge: {
    backgroundColor: Colors.yellow,
  },
  orderBadge: {
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: Colors.white,
  },
  coverBadgeText: {
    color: Colors.dark,
    fontWeight: "900",
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  coverActionBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  coverLabelRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  coverLabelText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  compactAddTile: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  compactAddText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.dark,
    marginTop: 4,
  },
  compactAddCount: {
    fontSize: 10,
    color: Colors.lightMuted,
    marginTop: 2,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 6,
  },
  tipText: {
    fontSize: 12,
    color: Colors.lightMuted,
    fontWeight: "500",
  },
});
