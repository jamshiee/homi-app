import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { PropertyDto } from '@api/types';
import { Colors } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface PropertyCardProps {
  property: PropertyDto;
  onPress?: (id: string) => void;
  onSaveToggle?: (id: string) => void;
  isSaved?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onSaveToggle,
  isSaved = false,
}) => {
  const { t } = useTranslation();

  const coverImage = property.propertyMedia?.find((m) => m.isCover)?.url || property.propertyMedia?.[0]?.url;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderModuleConditionalRow = () => {
    switch (property.type) {
      case 'land':
        return `${property.landDetail?.totalArea || 0} ${property.landDetail?.areaUnit || 'Cents'} · ${
          property.landDetail?.hasRoadAccess ? t('property.road_access_yes', 'Road access ✓') : t('property.road_access_no', 'No road access')
        }`;
      case 'house':
        return `${property.houseDetail?.bedrooms || 0} BHK · ${property.houseDetail?.bathrooms || 0} Bath · ${
          property.houseDetail?.floors || 1
        } Floors`;
      case 'building':
        return `${property.buildingDetail?.totalArea || 0} sqft · Floor ${property.buildingDetail?.floorNumber || 0} · ${
          property.buildingDetail?.currentStatus || 'Vacant'
        }`;
      case 'hotel':
        return `${property.hotelDetail?.roomType || 'Single Room'} · ${property.hotelDetail?.propertySubtype || 'Lodge'} · ₹${
          property.hotelDetail?.pricePerNight || 0
        }/night`;
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(property.id)}
      style={{
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: Colors.border,
        marginHorizontal: 12,
        marginVertical: 6,
        overflow: 'hidden',
      }}
    >
      {/* Image Area */}
      <View style={{ height: 200, backgroundColor: Colors.surface, position: 'relative' }}>
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="camera-outline" size={32} color={Colors.lightMuted} />
            <Text style={{ color: Colors.lightMuted, marginTop: 8, fontSize: 13 }}>
              {t('property.no_photos', 'No photos')}
            </Text>
          </View>
        )}

        {/* Overlays */}
        {/* Owner Name Pill */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: Colors.overlay,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '500' }}>
            {property.listedByUser?.name || 'Owner'}
          </Text>
        </View>

        {/* Save Icon */}
        <TouchableOpacity
          onPress={() => onSaveToggle?.(property.id)}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: Colors.overlay,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={18}
            color={isSaved ? Colors.yellow : Colors.white}
          />
        </TouchableOpacity>

        {/* Featured Badge */}
        {property.isFeatured && (
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: Colors.yellow,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: Colors.dark, fontSize: 11, fontWeight: 'bold' }}>
              {t('property.featured', 'Featured')}
            </Text>
          </View>
        )}
      </View>

      {/* Content Area */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 4 }}>
          {renderModuleConditionalRow()}
        </Text>
        <Text style={{ fontSize: 17, fontWeight: 'bold', color: Colors.dark, marginBottom: 4 }} numberOfLines={1}>
          {property.title || `${property.type} for ${property.transactionType}`}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: Colors.dark, marginBottom: 8 }}>
          {formatPrice(property.price)}
        </Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="location-outline" size={14} color={Colors.muted} style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 13, color: Colors.muted }}>
            {property.locality}, {property.district}
          </Text>
        </View>
        
        <Text style={{ fontSize: 11, color: Colors.muted, marginBottom: 16 }}>
          {/* Mocking updated time for now */}
          {t('property.updated_days_ago', { days: 15, defaultValue: 'Updated 15d ago' })}
        </Text>

        {/* Action Buttons Row */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              height: 40,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: '#25D366',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#25D366', fontWeight: 'bold', fontSize: 13 }}>
              WhatsApp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              height: 40,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: Colors.dark,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: Colors.dark, fontWeight: 'bold', fontSize: 13 }}>
              {t('property.view_number', 'View Number')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.dark,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 13 }}>
              {t('property.call', 'Call')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};
