import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { useFilterStore, PropertyType, FilterState } from '@store/filter.store';
import { Ionicons } from '@expo/vector-icons';
import { TransactionTypeFilter } from '@/common/enums/transaction-type-filter.enum';
import { FurnishingStatusEnum } from '@/common/enums/furnishing-status.enum';
import { SortOptionEnum } from '@/common/enums/sort-option-filter.enum';
import { propertiesApi } from '@/api/properties.api';

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  
  const filterState = useFilterStore();
  const { setFilter, resetFilters } = filterState;

  // Local state
  const [localState, setLocalState] = useState<Partial<FilterState>>({});
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalState({
        sort: filterState.sort,
        type: filterState.type,
        transactionType: filterState.transactionType,
        district: filterState.district,
        minPrice: filterState.minPrice,
        maxPrice: filterState.maxPrice,
        bedrooms: filterState.bedrooms,
        bathrooms: filterState.bathrooms,
        furnishingStatus: filterState.furnishingStatus,
        minArea: filterState.minArea,
        maxArea: filterState.maxArea,
        areaUnit: filterState.areaUnit || 'cents',
        buildingSubtype: filterState.buildingSubtype,
        roomType: filterState.roomType,
      });
      // Fetch dynamic districts on open
      if (districts.length === 0) {
        setLoadingDistricts(true);
        propertiesApi.getDistricts()
          .then((res) => { setDistricts(res.data?.data ?? []); })
          .catch(() => {})
          .finally(() => setLoadingDistricts(false));
      }
    }
  }, [visible, filterState]);

  const handleApply = () => {
    setFilter(localState);
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    onClose();
  };

  const setProp = (key: keyof FilterState, value: any) => {
    setLocalState((prev) => ({ ...prev, [key]: value }));
  };

  const renderSectionHeader = (title: string) => (
    <Text style={{ fontSize: 11, color: Colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 24, fontWeight: '600' }}>
      {title}
    </Text>
  );

  const renderPill = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
    fullWidth = false
  ) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? Colors.yellow : Colors.white,
        borderWidth: 1.5,
        borderColor: isSelected ? Colors.dark : Colors.border,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        width: fullWidth ? '100%' : 'auto',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: isSelected ? Colors.dark : Colors.muted, fontWeight: isSelected ? 'bold' : '500', fontSize: 13 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        
        <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' }}>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#D1D1D1', borderRadius: 2 }} />
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
            
            {/* SORT */}
            {renderSectionHeader(t('filter.sort_by', 'Sort By'))}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {[
                { label: t('filter.sort_newest', 'Newest First'), value: SortOptionEnum.Newest },
                { label: t('filter.sort_relevance', 'Relevance'), value: SortOptionEnum.Relevance },
                { label: t('filter.sort_price_low', 'Price: Low to High'), value: SortOptionEnum.PriceAsc },
                { label: t('filter.sort_price_high', 'Price: High to Low'), value: SortOptionEnum.PriceDesc },
              ].map((opt) =>
                renderPill(opt.label, localState.sort === opt.value, () => setProp('sort', opt.value))
              )}
            </View>

            {/* PROPERTY TYPE */}
            {renderSectionHeader(t('filter.module', 'Property Type'))}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {[
                { label: t('modules.land', 'Land/Plot'), value: 'land' },
                { label: t('modules.house', 'House'), value: 'house' },
                { label: t('modules.building', 'Building'), value: 'building' },
                { label: t('modules.hotel', 'Hotel/PG'), value: 'hotel' },
              ].map((opt) =>
                renderPill(opt.label, localState.type === opt.value, () => {
                  setLocalState((s) => ({
                    ...s,
                    type: s.type === opt.value ? 'all' : (opt.value as PropertyType),
                  }));
                })
              )}
            </View>

            {/* TRANSACTION TYPE */}
            {renderSectionHeader(t('filter.transaction', 'Transaction Type'))}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {[
                { label: t('filter.tx_buy', 'Buy'), value: TransactionTypeFilter.BUY },
                { label: t('filter.tx_rent', 'Rent'), value: TransactionTypeFilter.RENT },
                { label: t('filter.tx_lease', 'Lease'), value: TransactionTypeFilter.LEASE },
              ].map((opt) =>
                renderPill(opt.label, localState.transactionType === opt.value, () => {
                  setLocalState((s) => ({
                    ...s,
                    transactionType: s.transactionType === opt.value ? TransactionTypeFilter.ALL : (opt.value as TransactionTypeFilter),
                  }));
                })
              )}
            </View>

            {/* DISTRICT */}
            {renderSectionHeader(t('filter.district', 'District'))}
            {loadingDistricts ? (
              <ActivityIndicator size="small" color={Colors.yellow} />
            ) : districts.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {districts.map((d) =>
                  renderPill(d, localState.district === d, () =>
                    setLocalState((s) => ({ ...s, district: s.district === d ? undefined : d }))
                  )
                )}
              </View>
            ) : (
              <Text style={{ fontSize: 13, color: Colors.lightMuted, marginBottom: 8 }}>
                No districts available yet
              </Text>
            )}

            {/* PRICE */}
            {renderSectionHeader(t('filter.price', 'Price Range (₹)'))}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: 'center' }}>
                <TextInput
                  placeholder="Min"
                  keyboardType="numeric"
                  value={localState.minPrice ? String(localState.minPrice) : ''}
                  onChangeText={(val) => setProp('minPrice', val ? parseInt(val) : undefined)}
                  style={{ fontSize: 14, color: Colors.dark }}
                />
              </View>
              <Text style={{ color: Colors.muted }}>to</Text>
              <View style={{ flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: 'center' }}>
                <TextInput
                  placeholder="Max"
                  keyboardType="numeric"
                  value={localState.maxPrice ? String(localState.maxPrice) : ''}
                  onChangeText={(val) => setProp('maxPrice', val ? parseInt(val) : undefined)}
                  style={{ fontSize: 14, color: Colors.dark }}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {renderPill('< 10 Lakhs', localState.maxPrice === 1000000 && !localState.minPrice, () => {
                setProp('minPrice', undefined); setProp('maxPrice', 1000000);
              })}
              {renderPill('10L - 50L', localState.minPrice === 1000000 && localState.maxPrice === 5000000, () => {
                setProp('minPrice', 1000000); setProp('maxPrice', 5000000);
              })}
              {renderPill('50L - 1Cr', localState.minPrice === 5000000 && localState.maxPrice === 10000000, () => {
                setProp('minPrice', 5000000); setProp('maxPrice', 10000000);
              })}
              {renderPill('1Cr+', localState.minPrice === 10000000 && !localState.maxPrice, () => {
                setProp('minPrice', 10000000); setProp('maxPrice', undefined);
              })}
            </View>

            {/* DYNAMIC FILTERS: HOUSE */}
            {localState.type === 'house' && (
              <>
                {renderSectionHeader('Bedrooms')}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5].map((num) =>
                    renderPill(num === 5 ? '5+' : String(num), localState.bedrooms === num, () =>
                      setProp('bedrooms', localState.bedrooms === num ? undefined : num)
                    )
                  )}
                </View>

                {renderSectionHeader('Bathrooms')}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4].map((num) =>
                    renderPill(num === 4 ? '4+' : String(num), localState.bathrooms === num, () =>
                      setProp('bathrooms', localState.bathrooms === num ? undefined : num)
                    )
                  )}
                </View>

                {renderSectionHeader('Furnishing')}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Fully Furnished', value: FurnishingStatusEnum.FULLY_FURNISHED },
                    { label: 'Semi Furnished', value: FurnishingStatusEnum.SEMI_FURNISHED },
                    { label: 'Unfurnished', value: FurnishingStatusEnum.UN_FURNISHED },
                  ].map((opt) =>
                    renderPill(opt.label, localState.furnishingStatus === opt.value, () =>
                      setProp('furnishingStatus', localState.furnishingStatus === opt.value ? undefined : opt.value)
                    )
                  )}
                </View>
              </>
            )}

            {/* DYNAMIC FILTERS: LAND */}
            {localState.type === 'land' && (
              <>
                {renderSectionHeader('Area Unit')}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {['Cents', 'Sqft'].map((unit) =>
                    renderPill(unit, localState.areaUnit === unit, () => setProp('areaUnit', unit))
                  )}
                </View>

                {renderSectionHeader(`Area (${localState.areaUnit || 'Cents'})`)}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <View style={{ flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: 'center' }}>
                    <TextInput
                      placeholder="Min"
                      keyboardType="numeric"
                      value={localState.minArea ? String(localState.minArea) : ''}
                      onChangeText={(val) => setProp('minArea', val ? parseInt(val) : undefined)}
                      style={{ fontSize: 14, color: Colors.dark }}
                    />
                  </View>
                  <Text style={{ color: Colors.muted }}>to</Text>
                  <View style={{ flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: 'center' }}>
                    <TextInput
                      placeholder="Max"
                      keyboardType="numeric"
                      value={localState.maxArea ? String(localState.maxArea) : ''}
                      onChangeText={(val) => setProp('maxArea', val ? parseInt(val) : undefined)}
                      style={{ fontSize: 14, color: Colors.dark }}
                    />
                  </View>
                </View>
              </>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderTopWidth: 0.5, borderTopColor: Colors.border, backgroundColor: Colors.white }}>
            <TouchableOpacity onPress={handleReset} style={{ padding: 8 }}>
              <Text style={{ color: Colors.muted, fontSize: 13, textDecorationLine: 'underline' }}>
                {t('filter.reset_all', 'Reset All')}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 20 }}>
              <TouchableOpacity
                onPress={handleApply}
                style={{
                  backgroundColor: Colors.yellow,
                  height: 56,
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 16 }}>
                  {t('filter.apply', 'Apply Filters')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
