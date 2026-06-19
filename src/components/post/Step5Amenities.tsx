import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { usePostStore } from '../../store/postStore';
import { Colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/app.store';
import { t } from 'i18next';

interface AmenityData {
  id: string;
  nameEn: string;
  nameMl: string;
  iconName: string;
}
const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 50) / 3; // Slightly reduced to account for Android pixel rounding

export default function Step5Amenities() {
  const { type, amenityIds, setField } = usePostStore();
  const [amenities, setAmenities] = useState<AmenityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useAppStore()

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/amenities', {
          params: { module: type || 'house' },
        });
        if (res.data?.data) {
          setAmenities(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to fetch amenities:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAmenities();
  }, [type]);

  const toggleAmenity = (id: string) => {
    const current = amenityIds || [];
    if (current.includes(id)) {
      setField({ amenityIds: current.filter((x) => x !== id) });
    } else {
      setField({ amenityIds: [...current, id] });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.yellow} />
        <Text style={styles.loadingText}>{t('post.step5_loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('post.step5_title')}</Text>
      <Text style={styles.subtitle}>{t('post.step5_subtitle')}</Text>

      {amenities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="tag-off-outline" size={48} color={Colors.lightMuted} />
          <Text style={styles.emptyText}>{t('post.step5_empty')}</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {amenities.map((item) => {
            const isSelected = amenityIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => toggleAmenity(item.id)}
                style={[
                  styles.tile,
                  isSelected && styles.tileSelected,
                ]}
              >
                {isSelected && (
                  <View style={styles.badge}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={Colors.yellow} />
                  </View>
                )}
                <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                  <MaterialCommunityIcons
                    name={(item.iconName || 'checkbox-blank-circle-outline') as any}
                    size={28}
                    color={isSelected ? Colors.yellow : Colors.muted}
                  />
                </View>
                <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected]} numberOfLines={2}>
                  {language == 'en' ? item.nameEn : item.nameMl}
                </Text>
              </TouchableOpacity>
            );
          })}
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
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.lightMuted,
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.lightMuted,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.lightMuted,
    marginTop: 10,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH + 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  tileSelected: {
    borderColor: Colors.yellow,
    backgroundColor: '#FFFCF0', // Solid light yellow instead of transparent to prevent Android shadow bleed
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconWrapperSelected: {
    backgroundColor: Colors.yellow + '10',
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    textAlign: 'center',
  },
  tileLabelSelected: {
    color: Colors.dark,
    fontWeight: 'bold',
  },
});
