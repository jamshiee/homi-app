import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity, StyleSheet, ActivityIndicator, Switch, Platform, ScrollView } from 'react-native';
import { Colors } from '@constants/colors';
import { adminPropertiesApi } from '@api/admin-properties.api';
import { PropertyDto } from '@api/types';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../hooks/useProperties";
import { t } from 'i18next';

interface Props {
  visible: boolean;
  property: PropertyDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FeatureConfigBottomSheet({ visible, property, onClose, onSuccess }: Props) {
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<number>(1);
  const [featuredUntil, setFeaturedUntil] = useState<Date | null>(null);
  const [dateMode, setDateMode] = useState<'7' | '14' | '30' | 'always' | 'other'>('always');
  const [featuredCount, setFeaturedCount] = useState<number>(0);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (visible && property) {
      setIsFeatured(property.isFeatured);
      setFeaturedOrder(property.featuredOrder || 1);
      
      if (property.featuredUntil) {
        setFeaturedUntil(new Date(property.featuredUntil));
        setDateMode('other'); 
      } else {
        setFeaturedUntil(null);
        setDateMode('always');
      }

      adminPropertiesApi.getAdminFeatured().then(res => {
         const count = res.data.data.length;
         setFeaturedCount(count);
         if (!property.isFeatured) {
            setFeaturedOrder(count + 1);
         }
      }).catch(console.error);
    }
  }, [visible, property]);

  if (!visible || !property) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await adminPropertiesApi.setFeatured(property.id, {
        isFeatured,
        featuredOrder: featuredOrder,
        featuredUntil: (dateMode === 'always' || !featuredUntil) ? undefined : featuredUntil.toISOString(),
      });
      Toast.show({ type: 'success', text1: 'Featured settings updated' });
      
      queryClient.invalidateQueries({ queryKey: ["properties", "feed"] });
      queryClient.invalidateQueries({ queryKey: ["properties", "featured"] });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Failed to update featured status' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setFeaturedUntil(date);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.sheet}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>{property.title || property.type}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{property.address}</Text>

          <ScrollView style={[styles.form, { flexShrink: 1 }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            <View style={styles.row}>
              <Text style={styles.labelRow}>{t('featured.is_featured')}</Text>
              <Switch 
                value={isFeatured} 
                onValueChange={setIsFeatured} 
                trackColor={{ true: Colors.yellow, false: Colors.border }}
                thumbColor={Platform.OS === 'android' ? Colors.white : undefined} 
              />
            </View>

            {isFeatured && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('featured.position')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {Array.from({ length: Math.max(1, property.isFeatured ? featuredCount : featuredCount + 1) }, (_, i) => i + 1).map(num => (
                      <TouchableOpacity 
                        key={num} 
                        style={[styles.quickDateBtn, featuredOrder === num && styles.quickDateBtnActive]} 
                        onPress={() => setFeaturedOrder(num)}
                      >
                        <Text style={[styles.quickDateText, featuredOrder === num && styles.quickDateTextActive]}>{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('featured.featured_until')}</Text>
                  
                  <View style={[styles.quickDates, { flexWrap: 'wrap' }]}>
                    <TouchableOpacity style={[styles.quickDateBtn, dateMode === '7' && styles.quickDateBtnActive]} onPress={() => { setDateMode('7'); addDays(7); }}>
                      <Text style={[styles.quickDateText, dateMode === '7' && styles.quickDateTextActive]}>7 {t('common.days')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickDateBtn, dateMode === '14' && styles.quickDateBtnActive]} onPress={() => { setDateMode('14'); addDays(14); }}>
                      <Text style={[styles.quickDateText, dateMode === '14' && styles.quickDateTextActive]}>14 {t('common.days')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickDateBtn, dateMode === '30' && styles.quickDateBtnActive]} onPress={() => { setDateMode('30'); addDays(30); }}>
                      <Text style={[styles.quickDateText, dateMode === '30' && styles.quickDateTextActive]}>30 {t('common.days')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickDateBtn, dateMode === 'always' && styles.quickDateBtnActive]} onPress={() => { setDateMode('always'); setFeaturedUntil(null); }}>
                      <Text style={[styles.quickDateText, dateMode === 'always' && styles.quickDateTextActive]}>{t('common.always')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickDateBtn, dateMode === 'other' && styles.quickDateBtnActive]} onPress={() => { setDateMode('other'); if (!featuredUntil) setFeaturedUntil(new Date()); }}>
                      <Text style={[styles.quickDateText, dateMode === 'other' && styles.quickDateTextActive]}>{t('common.other')}</Text>
                    </TouchableOpacity>
                  </View>

                  {dateMode !== 'always' && dateMode !== 'other' && featuredUntil && (
                    <Text style={{ fontSize: 13, color: Colors.muted, marginTop: -4, marginBottom: 8, fontWeight: '500' }}>
                      {t('featured.expires_on')}: {featuredUntil.toLocaleDateString()}
                    </Text>
                  )}

                  {dateMode === 'other' && Platform.OS === 'ios' && (
                    <View style={{ marginTop: 12, backgroundColor: Colors.surface, borderRadius: 12, padding: 8 }}>
                      <DateTimePicker
                        value={featuredUntil || new Date()}
                        mode="date"
                        display="inline"
                        themeVariant="light"
                        onChange={(event, date) => {
                          if (date) setFeaturedUntil(date);
                        }}
                        minimumDate={new Date()}
                      />
                    </View>
                  )}

                  {dateMode === 'other' && Platform.OS === 'android' && (
                    <TouchableOpacity style={[styles.datePickerBtn, { marginTop: 4, marginBottom: 12 }]} onPress={() => setShowDatePicker(true)}>
                      <Text style={styles.datePickerText}>
                        {featuredUntil ? featuredUntil.toLocaleDateString() : t('common.select_date')}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {showDatePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                      value={featuredUntil || new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setFeaturedUntil(date);
                      }}
                      minimumDate={new Date()}
                    />
                  )}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>{t('common.save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: 24,
  },
  form: {
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  labelRow: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
    color: Colors.dark,
  },
  quickDates: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickDateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickDateBtnActive: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  quickDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark,
  },
  quickDateTextActive: {
    color: Colors.white,
  },
  datePickerBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: Colors.dark,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  saveBtn: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
