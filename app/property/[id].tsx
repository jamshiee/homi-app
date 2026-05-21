import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Linking, Modal, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { useTranslation } from 'react-i18next';
import { usePropertyDetail, useToggleSave } from '@hooks/useProperties';
import { PropertyDto, PropertyMediaDto } from '@api/types';
import { propertiesApi } from '@api/properties.api';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const { data, isLoading } = usePropertyDetail(id as string);
  const toggleSaveMutation = useToggleSave();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AMENITIES' | 'NEIGHBORHOOD'>('OVERVIEW');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [contactSheetVisible, setContactSheetVisible] = useState(false);
  const [numberSheetVisible, setNumberSheetVisible] = useState(false);

  const property = data?.data?.data as PropertyDto;

  if (isLoading || !property) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.muted }}>{t('common.loading', 'Loading...')}</Text>
      </View>
    );
  }

  // Derived state
  const images = property.propertyMedia?.sort((a, b) => a.order - b.order) || [];
  const isSaved = false; 

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleBack = () => router.back();
  const handleToggleSave = () => toggleSaveMutation.mutate(property.id);

  const handleChat = async () => {
    await propertiesApi.logEnquiry(property.id, 'whatsapp');
    Linking.openURL(`whatsapp://send?phone=${property.contactPhone}&text=Hi, I am interested in your property: ${property.title}`);
    setContactSheetVisible(false);
  };

  const handleViewNumber = async () => {
    await propertiesApi.logEnquiry(property.id, 'phone_reveal');
    setContactSheetVisible(false);
    setNumberSheetVisible(true);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${property.contactPhone}`);
  };

  const renderModuleStats = () => {
    const items = [];
    if (property.type === 'land') {
      items.push({ icon: 'expand-outline', value: `${property.landDetail?.totalArea} ${property.landDetail?.areaUnit}` });
      items.push({ icon: 'car-outline', value: property.landDetail?.hasRoadAccess ? 'Road Access ✓' : 'No Road Access' });
    } else if (property.type === 'house') {
      items.push({ icon: 'bed-outline', value: `${property.houseDetail?.bedrooms} Beds` });
      items.push({ icon: 'water-outline', value: `${property.houseDetail?.bathrooms} Baths` });
      items.push({ icon: 'layers-outline', value: `${property.houseDetail?.floors} Floors` });
    } else if (property.type === 'building') {
      items.push({ icon: 'expand-outline', value: `${property.buildingDetail?.totalArea} sqft` });
      items.push({ icon: 'business-outline', value: `Floor ${property.buildingDetail?.floorNumber}` });
      items.push({ icon: 'key-outline', value: property.buildingDetail?.currentStatus });
    } else if (property.type === 'hotel') {
      items.push({ icon: 'bed-outline', value: property.hotelDetail?.roomType });
      items.push({ icon: 'home-outline', value: property.hotelDetail?.propertySubtype });
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        {items.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
            <Ionicons name={item.icon as any} size={18} color={Colors.muted} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.dark }}>{item.value}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderContactSheet = () => (
    <Modal visible={contactSheetVisible} transparent animationType="slide" onRequestClose={() => setContactSheetVisible(false)}>
      <View style={{ flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={() => setContactSheetVisible(false)} />
        <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#D1D1D1', borderRadius: 2, alignSelf: 'center', marginBottom: 24, marginTop: -12 }} />
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.dark }}>{property.listedByUser?.name?.[0] || 'O'}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.dark }}>{property.listedByUser?.name || 'Owner'}</Text>
              <View style={{ backgroundColor: Colors.surface, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: Colors.muted }}>OWNER</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleChat} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#25D366', padding: 16, borderRadius: 16, marginBottom: 12 }}>
            <Ionicons name="logo-whatsapp" size={24} color={Colors.white} />
            <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 16, marginLeft: 12 }}>WhatsApp Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleViewNumber} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.dark, padding: 16, borderRadius: 16 }}>
            <Ionicons name="call-outline" size={24} color={Colors.dark} />
            <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 16, marginLeft: 12 }}>View Number</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 12, color: Colors.muted, textAlign: 'center', marginTop: 24 }}>
            Contact details shared with your number.
          </Text>
        </View>
      </View>
    </Modal>
  );

  const renderNumberSheet = () => (
    <Modal visible={numberSheetVisible} transparent animationType="slide" onRequestClose={() => setNumberSheetVisible(false)}>
      <View style={{ flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={() => setNumberSheetVisible(false)} />
        <View style={{ backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, alignItems: 'center' }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#D1D1D1', borderRadius: 2, marginBottom: 24, marginTop: -12 }} />
          
          <Text style={{ fontSize: 11, color: Colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 'bold' }}>
            OUR CONTACT NUMBER
          </Text>
          <Text style={{ fontSize: 36, fontWeight: 'bold', color: Colors.dark, marginBottom: 32 }}>
            {property.contactPhone}
          </Text>

          {property.alternatePhone && (
            <>
              <Text style={{ fontSize: 11, color: Colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 'bold' }}>
                ALTERNATE NUMBER
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.dark, marginBottom: 32 }}>
                {property.alternatePhone}
              </Text>
            </>
          )}

          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <TouchableOpacity style={{ flex: 1, height: 56, borderRadius: 30, borderWidth: 1.5, borderColor: Colors.dark, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 16 }}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCall} style={{ flex: 1, height: 56, borderRadius: 30, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 16 }}>Call Now</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 24, display: 'flex', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.success} /> Verified by Homi Holdings
          </Text>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={{ height: 260, width, backgroundColor: Colors.surface, position: 'relative' }}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                setActiveImageIndex(Math.floor(e.nativeEvent.contentOffset.x / width));
              }}
            >
              {images.map((img) => (
                <Image key={img.id} source={{ uri: img.url }} style={{ width, height: 260 }} />
              ))}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="camera-outline" size={48} color={Colors.lightMuted} />
              <Text style={{ color: Colors.lightMuted, marginTop: 8 }}>No photos available</Text>
            </View>
          )}

          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <TouchableOpacity onPress={handleBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="share-social-outline" size={20} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToggleSave} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlay, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? Colors.yellow : Colors.white} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {images.length > 1 && (
            <View style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: Colors.overlay, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: Colors.white, fontSize: 13, fontWeight: 'bold' }}>
                {activeImageIndex + 1}/{images.length}
              </Text>
            </View>
          )}
        </View>

        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: Colors.muted, textTransform: 'uppercase' }}>
                For {property.transactionType}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: Colors.dark, marginBottom: 8 }}>
            {property.title}
          </Text>
          <Text style={{ fontSize: 26, fontWeight: 'bold', color: Colors.dark, marginBottom: 8 }}>
            {formatPrice(property.price)}
            {property.transactionType === 'rent' ? <Text style={{ fontSize: 14, color: Colors.muted }}> / month</Text> : ''}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={16} color={Colors.muted} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 14, color: Colors.muted }}>
              {property.locality}, {property.district}
            </Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 16 }} />

        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 16 }}>
          {['OVERVIEW', 'AMENITIES', 'NEIGHBORHOOD'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={{
                marginRight: 24,
                paddingBottom: 8,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab ? Colors.yellow : 'transparent',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: activeTab === tab ? 'bold' : '500', color: activeTab === tab ? Colors.dark : Colors.muted }}>
                {tab === 'NEIGHBORHOOD' ? 'Neighborhood' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'OVERVIEW' && (
          <View style={{ marginTop: 8 }}>
            {renderModuleStats()}
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <Text style={{ fontSize: 15, color: Colors.dark, lineHeight: 24 }}>
                {property.description || 'No description provided.'}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'AMENITIES' && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: Colors.muted }}>No amenities listed</Text>
          </View>
        )}

        {activeTab === 'NEIGHBORHOOD' && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: Colors.muted }}>Neighborhood data coming soon</Text>
          </View>
        )}

      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopWidth: 0.5, borderTopColor: Colors.border }}>
        <SafeAreaView edges={['bottom']} style={{ flexDirection: 'row', padding: 16, gap: 12 }}>
          <TouchableOpacity onPress={handleChat} style={{ flex: 1, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#25D366', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#25D366', fontWeight: 'bold', fontSize: 15 }}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleViewNumber} style={{ flex: 1, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: Colors.dark, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 15 }}>View Number</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setContactSheetVisible(true)} style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: Colors.dark, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 15 }}>Contact</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {renderContactSheet()}
      {renderNumberSheet()}
    </View>
  );
}
