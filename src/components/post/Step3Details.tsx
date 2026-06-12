import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { usePostStore } from '../../store/postStore';
import { Colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FurnishingStatusEnum } from '@/common/enums/property-enums/furnishing-status.enum';
import { BuildingSubTypeEnum } from '@/common/enums/property-enums/building-subtype.enum';
import { HotelSubTypeEnum } from '@/common/enums/property-enums/hotel-subtype.enum';
import { RoomTypeEnum } from '@/common/enums/property-enums/room-type.enum';
import { PropertyTypeEnum } from '@/common/enums/property-enums/property-type.enum';
import { AreaUnitEnum } from '@/common/enums/property-enums/area-unit.enum';
import { BuildingStatusEnum } from '@/common/enums/property-enums/building-status.enum';
import { useTranslation } from 'react-i18next';

interface StepperProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

function Stepper({ label, value, onChange, min = 0, max = 99 }: StepperProps) {
  return (
    <View style={styles.stepperContainer}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onChange(Math.max(min, value - 1))}
          style={styles.stepperButton}
        >
          <MaterialCommunityIcons name="minus" size={18} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onChange(Math.min(max, value + 1))}
          style={styles.stepperButton}
        >
          <MaterialCommunityIcons name="plus" size={18} color={Colors.dark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Step3Details() {
  const { type, landDetail, houseDetail, buildingDetail, hotelDetail, setField } = usePostStore();
  const { t } = useTranslation();

  const handleUpdateLand = (updates: any) => {
    setField({ landDetail: { ...(landDetail || { totalArea: 0, areaUnit: AreaUnitEnum.CENT }), ...updates } });
  };

  const handleUpdateHouse = (updates: any) => {
    setField({
      houseDetail: {
        ...(houseDetail || {
          bedrooms: 2,
          bathrooms: 2,
          balconies: 1,
          floors: 1,
          hasKitchen: true,
          furnishingStatus: FurnishingStatusEnum.UN_FURNISHED,
        }),
        ...updates,
      },
    });
  };

  const handleUpdateBuilding = (updates: any) => {
    setField({
      buildingDetail: {
        ...(buildingDetail || {
          subType: BuildingSubTypeEnum.OFFICE,
          totalArea: 0,
          areaUnit: AreaUnitEnum.CENT,
          floorNumber: 0,
          currentStatus: 'ready_to_move',
        }),
        ...updates,
      },
    });
  };

  const handleUpdateHotel = (updates: any) => {
    setField({
      hotelDetail: {
        ...(hotelDetail || {
          subType: HotelSubTypeEnum.HOTEL,
          roomType: RoomTypeEnum.DOUBLE,
          occupancy: 1,
          mealsIncluded: false,
        }),
        ...updates,
      },
    });
  };

  // 1. LAND DETAILS FORM
  if (type === PropertyTypeEnum.LAND) {
    const details = landDetail || { totalArea: 0, areaUnit: AreaUnitEnum.CENT };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('post.step3_land_title')}</Text>
        <Text style={styles.subtitle}>{t('post.step3_land_subtitle')}</Text>

        <Text style={styles.label}>{t('post.step3_land_area_label')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="0"
            placeholderTextColor={Colors.lightMuted}
            keyboardType="numeric"
            value={details.totalArea ? details.totalArea.toString() : ''}
            onChangeText={(v) => handleUpdateLand({ totalArea: parseFloat(v) || 0 })}
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>{t('post.step3_land_unit_label')}</Text>
        <View style={styles.pillContainer}>
          {Object.entries(AreaUnitEnum).map(([key, value]) => {
            const isSelected = details.areaUnit === value;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                onPress={() => handleUpdateLand({ areaUnit: value })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // 2. HOUSE DETAILS FORM
  if (type === PropertyTypeEnum.HOUSE) {
    const details = houseDetail || {
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      floors: 1,
      hasKitchen: true,
      furnishingStatus: FurnishingStatusEnum.UN_FURNISHED,
    };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('post.step3_house_title')}</Text>
        <Text style={styles.subtitle}>{t('post.step3_house_subtitle')}</Text>

        <Stepper
          label={t('post.step3_house_bedrooms')}
          value={details.bedrooms}
          onChange={(val) => handleUpdateHouse({ bedrooms: val })}
          min={1}
        />
        <Stepper
          label={t('post.step3_house_bathrooms')}
          value={details.bathrooms}
          onChange={(val) => handleUpdateHouse({ bathrooms: val })}
          min={1}
        />
        <Stepper
          label={t('post.step3_house_balconies')}
          value={details.balconies}
          onChange={(val) => handleUpdateHouse({ balconies: val })}
        />
        <Stepper
          label={t('post.step3_house_floors')}
          value={details.floors}
          onChange={(val) => handleUpdateHouse({ floors: val })}
          min={1}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('post.step3_house_kitchen')}</Text>
          <Switch
            value={details.hasKitchen}
            onValueChange={(val) => handleUpdateHouse({ hasKitchen: val })}
            trackColor={{ false: Colors.border, true: Colors.yellow }}
            thumbColor={Colors.white}
          />
        </View>

        <Text style={styles.label}>{t('post.step3_house_furnishing')}</Text>
        <View style={styles.pillContainer}>
          {[FurnishingStatusEnum.UN_FURNISHED, FurnishingStatusEnum.SEMI_FURNISHED, FurnishingStatusEnum.FULLY_FURNISHED].map((status) => {
            const isSelected = details.furnishingStatus === status;
            return (
              <TouchableOpacity
                key={status}
                activeOpacity={0.7}
                onPress={() => handleUpdateHouse({ furnishingStatus: status })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {status.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // 3. COMMERCIAL BUILDING DETAILS FORM
  if (type === PropertyTypeEnum.BUILDING) {
    const details = buildingDetail || {
      subType: BuildingSubTypeEnum.ROOM,
      totalArea: 0,
      areaUnit: AreaUnitEnum.CENT,
      floorNumber: 0,
      currentStatus: 'ready_to_move',
    };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('post.step3_building_title')}</Text>
        <Text style={styles.subtitle}>{t('post.step3_building_subtitle')}</Text>

        <Text style={styles.label}>{t('post.step3_building_subtype')}</Text>
        <View style={styles.pillContainer}>
          {Object.values(BuildingSubTypeEnum).map((sub) => {
            const isSelected = details.subType === sub;
            return (
              <TouchableOpacity
                key={sub}
                activeOpacity={0.7}
                onPress={() => handleUpdateBuilding({ subType: sub })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {sub.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>{t('post.step3_building_area')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="0"
            placeholderTextColor={Colors.lightMuted}
            keyboardType="numeric"
            value={details.totalArea ? details.totalArea.toString() : ''}
            onChangeText={(v) => handleUpdateBuilding({ totalArea: parseFloat(v) || 0 })}
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>{t('post.step3_building_unit')}</Text>
        <View style={styles.pillContainer}>
          {Object.entries(AreaUnitEnum).map(([key, value]) => {
            const isSelected = details.areaUnit === value;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                onPress={() => handleUpdateBuilding({ areaUnit: value })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Stepper
          label={t('post.step3_building_floor')}
          value={details.floorNumber}
          onChange={(val) => handleUpdateBuilding({ floorNumber: val })}
        />

        <Text style={styles.label}>{t('post.step3_building_status')}</Text>
        <View style={styles.pillContainer}>
          {Object.entries(BuildingStatusEnum).map(([key, value]) => {
            const isSelected = details.currentStatus === value;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                onPress={() => handleUpdateBuilding({ currentStatus: value })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {key.replaceAll('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // 4. HOTEL / PG DETAILS FORM
  if (type === PropertyTypeEnum.HOTEL) {
    const details = hotelDetail || {
      subType: HotelSubTypeEnum.HOTEL,
      roomType: RoomTypeEnum.SINGLE,
      occupancy: 1,
      mealsIncluded: false,
    };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('post.step3_hotel_title')}</Text>
        <Text style={styles.subtitle}>{t('post.step3_hotel_subtitle')}</Text>

        <Text style={styles.label}>{t('post.step3_hotel_subtype')}</Text>
        <View style={styles.pillContainer}>
          {Object.entries(HotelSubTypeEnum).map(([key, value]) => {
            const isSelected = details.subType === value;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                onPress={() => handleUpdateHotel({ subType: value })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {key.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>{t('post.step3_hotel_roomtype')}</Text>
        <View style={styles.pillContainer}>
          {Object.entries(RoomTypeEnum).map(([key, value]) => {
            const isSelected = details.roomType === value;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.7}
                onPress={() => handleUpdateHotel({ roomType: value })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {key.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Stepper
          label={t('post.step3_hotel_occupancy')}
          value={details.occupancy}
          onChange={(val) => handleUpdateHotel({ occupancy: val })}
          min={1}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('post.step3_hotel_meals')}</Text>
          <Switch
            value={details.mealsIncluded}
            onValueChange={(val) => handleUpdateHotel({ mealsIncluded: val })}
            trackColor={{ false: Colors.border, true: Colors.yellow }}
            thumbColor={Colors.white}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{t('post.step3_select_type_first')}</Text>
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
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 15,
    color: Colors.dark,
    paddingVertical: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  stepperLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  pillSelected: {
    borderColor: Colors.yellow,
    backgroundColor: Colors.yellow + '08',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.lightMuted,
  },
  pillTextSelected: {
    color: Colors.yellow,
    fontWeight: 'bold',
  },
});
