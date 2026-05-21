import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { useActiveFilters } from '@hooks/useActiveFilters';

interface FilterButtonProps {
  onPress: () => void;
  size?: number;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ onPress, size = 48 }) => {
  const activeFilters = useActiveFilters();
  const count = activeFilters.length;
  const isFiltered = count > 0;

  const iconSize = Math.round(size * 0.42);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: isFiltered ? Colors.yellow : Colors.border,
          borderWidth: isFiltered ? 2 : 1.5,
          backgroundColor: Colors.white,
        },
      ]}
    >
      <Ionicons name="options-outline" size={iconSize} color={Colors.dark} />
      
      {isFiltered && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: Colors.yellow,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.dark,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
