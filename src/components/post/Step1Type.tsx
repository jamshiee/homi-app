import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePostStore } from '@store/postStore';
import { Colors } from '@constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PropertyTypeEnum } from '@/common/enums/property-enums/property-type.enum';

interface TypeOption {
  key: PropertyTypeEnum;
  label: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

const OPTIONS: TypeOption[] = [
  {
    key: PropertyTypeEnum.HOUSE,
    label: 'House',
    description: 'Independent homes, and residential units',
    icon: 'home-city-outline',
    color: '#3B82F6',
  },
  {
    key: PropertyTypeEnum.LAND,
    label: 'Land / Cent',
    description: 'Residential plots, commercial acres, agricultural land, and cents',
    icon: 'image-filter-hdr',
    color: '#10B981',
  },
  {
    key: PropertyTypeEnum.BUILDING,
    label: 'Commercial Building',
    description: 'Rooms, office spaces, warehouses',
    icon: 'office-building-outline',
    color: '#8B5CF6',
  },
  {
    key: PropertyTypeEnum.HOTEL,
    label: 'Hotel / PG / Resort / Lodge',
    description: 'Paying guest accommodations, rooms, short-stays, and lodges',
    icon: 'bed-outline',
    color: '#EC4899',
  },
];

export default function Step1Type() {
  const { type, setField } = usePostStore();

  const handleSelect = (key: PropertyTypeEnum) => {
    setField({ type: key });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What type of property is this?</Text>
      <Text style={styles.subtitle}>Select a category to customize listing details and specs</Text>

      <View style={styles.grid}>
        {OPTIONS.map((opt) => {
          const isSelected = type === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.7}
              onPress={() => handleSelect(opt.key)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                { borderLeftColor: opt.color },
              ]}
            >
              <View style={styles.header}>
                <View style={[styles.iconWrapper, { backgroundColor: opt.color + '15' }]}>
                  <MaterialCommunityIcons name={opt.icon} size={28} color={opt.color} />
                </View>
                {isSelected && (
                  <View style={styles.badge}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={Colors.yellow} />
                  </View>
                )}
              </View>
              <Text style={styles.label}>{opt.label}</Text>
              <Text style={styles.description}>{opt.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: Colors.yellow,
    backgroundColor: Colors.yellow + '05',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.lightMuted,
    lineHeight: 18,
  },
});
