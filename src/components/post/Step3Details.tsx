import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { usePostStore } from '../../store/postStore';
import { Colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FurnishingStatusEnum } from '@/common/enums/furnishing-status.enum';

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

  const handleUpdateLand = (updates: any) => {
    setField({ landDetail: { ...(landDetail || { totalArea: 0, areaUnit: 'cents' }), ...updates } });
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
          subType: 'office',
          totalArea: 0,
          areaUnit: 'cents',
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
          subType: 'hotel',
          roomsAvailable: 5,
          roomType: 'double',
          occupancy: 'any',
          mealsIncluded: false,
        }),
        ...updates,
      },
    });
  };

  // 1. LAND DETAILS FORM
  if (type === 'land') {
    const details = landDetail || { totalArea: 0, areaUnit: 'cents' };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Land Metrics</Text>
        <Text style={styles.subtitle}>Enter the surface area and metric boundaries</Text>

        <Text style={styles.label}>Total Area *</Text>
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

        <Text style={styles.label}>Area Unit *</Text>
        <View style={styles.pillContainer}>
          {['cents', 'sqft', 'acres'].map((unit) => {
            const isSelected = details.areaUnit === unit;
            return (
              <TouchableOpacity
                key={unit}
                activeOpacity={0.7}
                onPress={() => handleUpdateLand({ areaUnit: unit })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {unit.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // 2. HOUSE DETAILS FORM
  if (type === 'house') {
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
        <Text style={styles.title}>House Specifications</Text>
        <Text style={styles.subtitle}>Specify rooms, kitchen, and furnishing parameters</Text>

        <Stepper
          label="Bedrooms"
          value={details.bedrooms}
          onChange={(val) => handleUpdateHouse({ bedrooms: val })}
          min={1}
        />
        <Stepper
          label="Bathrooms"
          value={details.bathrooms}
          onChange={(val) => handleUpdateHouse({ bathrooms: val })}
          min={1}
        />
        <Stepper
          label="Balconies"
          value={details.balconies}
          onChange={(val) => handleUpdateHouse({ balconies: val })}
        />
        <Stepper
          label="Total Floors"
          value={details.floors}
          onChange={(val) => handleUpdateHouse({ floors: val })}
          min={1}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Has Kitchen / Pantry?</Text>
          <Switch
            value={details.hasKitchen}
            onValueChange={(val) => handleUpdateHouse({ hasKitchen: val })}
            trackColor={{ false: Colors.border, true: Colors.yellow }}
            thumbColor={Colors.white}
          />
        </View>

        <Text style={styles.label}>Furnishing Status *</Text>
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
  if (type === 'building') {
    const details = buildingDetail || {
      subType: 'office',
      totalArea: 0,
      areaUnit: 'cents',
      floorNumber: 0,
      currentStatus: 'ready_to_move',
    };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Building Specifications</Text>
        <Text style={styles.subtitle}>Enter commercial metrics, subtype, and active state</Text>

        <Text style={styles.label}>Commercial Subtype *</Text>
        <View style={styles.pillContainer}>
          {['office', 'retail', 'warehouse', 'shop', 'other'].map((sub) => {
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

        <Text style={styles.label}>Total Area *</Text>
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

        <Text style={styles.label}>Area Unit *</Text>
        <View style={styles.pillContainer}>
          {['cents', 'sqft', 'acres'].map((unit) => {
            const isSelected = details.areaUnit === unit;
            return (
              <TouchableOpacity
                key={unit}
                activeOpacity={0.7}
                onPress={() => handleUpdateBuilding({ areaUnit: unit })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {unit.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Stepper
          label="Floor Level"
          value={details.floorNumber}
          onChange={(val) => handleUpdateBuilding({ floorNumber: val })}
        />

        <Text style={styles.label}>Current Status *</Text>
        <View style={styles.pillContainer}>
          {['ready_to_move', 'under_construction'].map((status) => {
            const isSelected = details.currentStatus === status;
            return (
              <TouchableOpacity
                key={status}
                activeOpacity={0.7}
                onPress={() => handleUpdateBuilding({ currentStatus: status })}
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

  // 4. HOTEL / PG DETAILS FORM
  if (type === 'hotel') {
    const details = hotelDetail || {
      subType: 'hotel',
      roomsAvailable: 5,
      roomType: 'double',
      occupancy: 'any',
      mealsIncluded: false,
    };
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Short-stay & Room details</Text>
        <Text style={styles.subtitle}>Configure PG, rooms, capacity, and meals options</Text>

        <Text style={styles.label}>Hotel Subtype *</Text>
        <View style={styles.pillContainer}>
          {['hotel', 'pg', 'lodge', 'resort'].map((sub) => {
            const isSelected = details.subType === sub;
            return (
              <TouchableOpacity
                key={sub}
                activeOpacity={0.7}
                onPress={() => handleUpdateHotel({ subType: sub })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {sub.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Stepper
          label="Rooms / Units Available"
          value={details.roomsAvailable}
          onChange={(val) => handleUpdateHotel({ roomsAvailable: val })}
          min={1}
        />

        <Text style={styles.label}>Room Type *</Text>
        <View style={styles.pillContainer}>
          {['single', 'double', 'suite', 'dormitory'].map((room) => {
            const isSelected = details.roomType === room;
            return (
              <TouchableOpacity
                key={room}
                activeOpacity={0.7}
                onPress={() => handleUpdateHotel({ roomType: room })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {room.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Allowed Occupancy *</Text>
        <View style={styles.pillContainer}>
          {['single', 'sharing', 'any'].map((occ) => {
            const isSelected = details.occupancy === occ;
            return (
              <TouchableOpacity
                key={occ}
                activeOpacity={0.7}
                onPress={() => handleUpdateHotel({ occupancy: occ })}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {occ.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Meals / Food Included?</Text>
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
      <Text style={styles.subtitle}>Please select a property type in Step 1 first.</Text>
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
