import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { useFilterStore } from '@store/filter.store';
import { Ionicons } from '@expo/vector-icons';
import { propertiesApi } from '@/api/properties.api';

interface LocationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const filterState = useFilterStore();
  const { setFilter } = filterState;

  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch dynamic districts when the sheet opens (once per session)
  useEffect(() => {
    if (!visible || districts.length > 0) return;
    setLoading(true);
    propertiesApi.getDistricts()
      .then((res) => setDistricts(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible]);

  const handleSelect = (district: string | undefined) => {
    setFilter({ district });
    onClose();
  };

  const renderLocationItem = (label: string, value: string | undefined) => {
    const isSelected = filterState.district === value;
    return (
      <TouchableOpacity
        onPress={() => handleSelect(value)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        <Text style={{ fontSize: 16, color: isSelected ? Colors.dark : Colors.muted, fontWeight: isSelected ? 'bold' : '500' }}>
          {label}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={24} color={Colors.yellow} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 24 }}>
          {/* Drag Handle */}
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#D1D1D1', borderRadius: 2 }} />
          </View>

          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.dark }}>
              {t('location.select', 'Select District')}
            </Text>
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
            {renderLocationItem(t('location.all', 'All Locations'), undefined)}

            {loading ? (
              <ActivityIndicator color={Colors.yellow} style={{ marginTop: 24 }} />
            ) : districts.length > 0 ? (
              districts.map((district) => (
                <React.Fragment key={district}>
                  {renderLocationItem(district, district)}
                </React.Fragment>
              ))
            ) : (
              <Text style={{ color: Colors.lightMuted, fontSize: 14, marginTop: 16 }}>
                No active districts yet
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
