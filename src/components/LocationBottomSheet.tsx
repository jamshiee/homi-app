import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { useFilterStore } from '@store/filter.store';
import { Ionicons } from '@expo/vector-icons';
import { propertiesApi } from '@/api/properties.api';
import { useLocation } from '@/hooks/useLocation';

interface LocationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 'district' | 'locality';

export const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { district: activeDistrict, locality: activeLocality, setFilter } = useFilterStore();

  const [step, setStep] = useState<Step>('district');
  const [pendingDistrict, setPendingDistrict] = useState<string | undefined>(undefined);

  const [districts, setDistricts] = useState<string[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const { refetch: refetchLocation } = useLocation();

  // Reset to step 1 every time the sheet opens
  useEffect(() => {
    if (visible) {
      setStep('district');
      setPendingDistrict(undefined);
    }
  }, [visible]);

  // Fetch districts on first open
  useEffect(() => {
    if (!visible || districts.length > 0) return;
    setLoadingDistricts(true);
    propertiesApi
      .getDistricts()
      .then((res) => setDistricts(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingDistricts(false));
  }, [visible]);

  // Fetch localities when a district is pending
  useEffect(() => {
    if (!pendingDistrict) {
      setLocalities([]);
      return;
    }
    setLoadingLocalities(true);
    propertiesApi
      .getLocalities(pendingDistrict)
      .then((res) => {
        const data = res.data?.data ?? [];
        setLocalities(data);
        // If no localities exist for this district, skip to applying filter
        if (data.length === 0) {
          setFilter({ district: pendingDistrict, locality: undefined });
          onClose();
        } else {
          setStep('locality');
        }
      })
      .catch(() => {
        // On error, still apply district filter
        setFilter({ district: pendingDistrict, locality: undefined });
        onClose();
      })
      .finally(() => setLoadingLocalities(false));
  }, [pendingDistrict]);

  const handleDistrictSelect = (district: string | undefined) => {
    if (!district) {
      // "All Locations" — clear both
      setFilter({ district: undefined, locality: undefined });
      onClose();
      return;
    }
    setPendingDistrict(district);
    // Locality effect will handle the next step
  };

  const handleLocalitySelect = (locality: string | undefined) => {
    setFilter({ district: pendingDistrict, locality });
    onClose();
  };

  const handleBack = () => {
    setStep('district');
    setPendingDistrict(undefined);
  };

  const handleFetchLocation = async () => {
    setFetchingLocation(true);
    await refetchLocation();
    setFetchingLocation(false);
    onClose();
  };

  const renderRow = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
    sublabel?: string,
  ) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            color: isSelected ? Colors.dark : Colors.muted,
            fontWeight: isSelected ? '700' : '500',
          }}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={{ fontSize: 12, color: Colors.lightMuted, marginTop: 2 }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {isSelected && <Ionicons name="checkmark-circle" size={20} color={Colors.yellow} style={{ marginLeft: 8 }} />}
    </TouchableOpacity>
  );

  const isStep1 = step === 'district';
  const headerTitle = isStep1
    ? t('location.select', 'Select District')
    : pendingDistrict ?? '';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <View
          style={{
            backgroundColor: Colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80%',
            paddingBottom: 24,
          }}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#D1D1D1', borderRadius: 2 }} />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            {/* Back button on step 2 */}
            {!isStep1 && (
              <TouchableOpacity onPress={handleBack} style={{ marginRight: 12, padding: 4 }}>
                <Ionicons name="arrow-back" size={20} color={Colors.dark} />
              </TouchableOpacity>
            )}

            <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: Colors.dark }}>
              {headerTitle}
            </Text>

            {/* Step indicator */}
            <Text style={{ fontSize: 12, color: Colors.muted, marginRight: 12 }}>
              {isStep1 ? '1/2' : '2/2'}
            </Text>

            {/* Locate button — only on step 1 */}
            {isStep1 && (
              <TouchableOpacity
                onPress={handleFetchLocation}
                disabled={fetchingLocation}
                activeOpacity={0.8}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: Colors.yellow,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: fetchingLocation ? 0.6 : 1,
                }}
              >
                {fetchingLocation ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons name="locate" size={16} color="#000" />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Step 1 — Districts */}
          {isStep1 && (
            <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
              {renderRow(
                t('location.all', 'All Locations'),
                !activeDistrict,
                () => handleDistrictSelect(undefined),
                t('location.all_sub', 'Browse properties across all areas'),
              )}

              {loadingDistricts ? (
                <ActivityIndicator color={Colors.yellow} style={{ marginTop: 24 }} />
              ) : (
                districts.map((d) =>
                  renderRow(
                    d,
                    activeDistrict === d && !activeLocality,
                    () => handleDistrictSelect(d),
                    activeDistrict === d && activeLocality
                      ? `${activeLocality} selected`
                      : undefined,
                  )
                )
              )}

              {/* Padding at bottom for comfortable scrolling */}
              <View style={{ height: 24 }} />
            </ScrollView>
          )}

          {/* Step 2 — Localities */}
          {!isStep1 && (
            <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
              {/* "Any locality" option */}
              {renderRow(
                t('location.any_locality', 'Any locality in {{district}}', { district: pendingDistrict }),
                activeDistrict === pendingDistrict && !activeLocality,
                () => handleLocalitySelect(undefined),
              )}

              {loadingLocalities ? (
                <ActivityIndicator color={Colors.yellow} style={{ marginTop: 24 }} />
              ) : (
                localities.map((loc) =>
                  renderRow(
                    loc,
                    activeLocality === loc,
                    () => handleLocalitySelect(loc),
                  )
                )
              )}

              <View style={{ height: 24 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};
